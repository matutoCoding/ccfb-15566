// 渲染器:阴影贴图 + 身体网格 + 发丝,支持分屏对比和离屏导出
import { GpuCtx } from "../core/gpu";
import { OrbitCamera } from "../core/camera";
import { Mat4, Vec3, mat4LookAt, mat4Mul, mat4Ortho } from "../core/math";
import { PetModel } from "../pet/mesh";
import { HairSystem } from "../hair/hair_system";
import hairWgsl from "../shaders/hair_render.wgsl?raw";
import meshWgsl from "../shaders/mesh_render.wgsl?raw";
import shadowWgsl from "../shaders/shadow.wgsl?raw";

const SHADOW_SIZE = 2048;

export interface RenderOpts {
  time: number;
  lightDir: Vec3;
  lightIntensity: number;
  ambient: number;
  aoStrength: number;
  hairWidthScale: number;
  split?: boolean; // 左右分屏:左造型前 右当前
  clearColor: GPUColor;
}

export class Renderer {
  private gpu: GpuCtx;
  private hair: HairSystem;
  private device: GPUDevice;

  private frameBuf: GPUBuffer;
  private lightBuf: GPUBuffer;
  private shadowTex: GPUTexture;
  private shadowView: GPUTextureView;
  private shadowSampler: GPUSampler;

  private meshPipe!: GPURenderPipeline;
  private hairPipe!: GPURenderPipeline;
  private shadowPipe!: GPURenderPipeline;
  private frameLayout: GPUBindGroupLayout;
  private hairDataLayout: GPUBindGroupLayout;

  private vb: GPUBuffer | null = null;
  private ib: GPUBuffer | null = null;
  private indexCount = 0;

  constructor(gpu: GpuCtx, hair: HairSystem) {
    this.gpu = gpu;
    this.hair = hair;
    this.device = gpu.device;

    this.frameBuf = this.device.createBuffer({ size: 192, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.lightBuf = this.device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.shadowTex = this.device.createTexture({
      size: [SHADOW_SIZE, SHADOW_SIZE],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.shadowView = this.shadowTex.createView();
    this.shadowSampler = this.device.createSampler({ compare: "less" });

    this.frameLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "depth" } },
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "comparison" } },
      ],
    });
    this.hairDataLayout = this.device.createBindGroupLayout({
      entries: [0, 1, 2].map((binding) => ({
        binding,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "read-only-storage" as GPUBufferBindingType },
      })),
    });

    const meshModule = this.device.createShaderModule({ code: meshWgsl });
    this.meshPipe = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.frameLayout] }),
      vertex: {
        module: meshModule,
        entryPoint: "vs",
        buffers: [{
          arrayStride: 40,
          attributes: [
            { shaderLocation: 0, offset: 0, format: "float32x3" },
            { shaderLocation: 1, offset: 12, format: "float32x3" },
            { shaderLocation: 2, offset: 24, format: "float32" },
            { shaderLocation: 3, offset: 28, format: "float32x3" },
          ],
        }],
      },
      fragment: { module: meshModule, entryPoint: "fs", targets: [{ format: gpu.format }] },
      primitive: { topology: "triangle-list", cullMode: "back" },
      depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" },
    });

    const hairModule = this.device.createShaderModule({ code: hairWgsl });
    this.hairPipe = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.frameLayout, this.hairDataLayout] }),
      vertex: { module: hairModule, entryPoint: "vs" },
      fragment: { module: hairModule, entryPoint: "fs", targets: [{ format: gpu.format }] },
      primitive: { topology: "triangle-list" },
      depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less-equal" },
    });

    const shadowModule = this.device.createShaderModule({ code: shadowWgsl });
    this.shadowPipe = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shadowModule,
        entryPoint: "vs",
        buffers: [{
          arrayStride: 40,
          attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
        }],
      },
      primitive: { topology: "triangle-list", cullMode: "back" },
      depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" },
    });
  }

  setMesh(model: PetModel) {
    this.vb?.destroy();
    this.ib?.destroy();
    this.vb = this.device.createBuffer({
      size: model.vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.ib = this.device.createBuffer({
      size: model.indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vb, 0, model.vertices);
    this.device.queue.writeBuffer(this.ib, 0, model.indices);
    this.indexCount = model.indexCount;
  }

  private lightMatrix(lightDir: Vec3): Mat4 {
    const eye: Vec3 = [-lightDir[0] * 120, -lightDir[1] * 120, -lightDir[2] * 120];
    return mat4Mul(mat4Ortho(-55, 55, -55, 55, 1, 300), mat4LookAt(eye, [0, 15, 0], [0, 1, 0]));
  }

  private frameBindGroup(): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.frameLayout,
      entries: [
        { binding: 0, resource: { buffer: this.frameBuf } },
        { binding: 1, resource: this.shadowView },
        { binding: 2, resource: this.shadowSampler },
      ],
    });
  }

  private hairBindGroup(useBefore: boolean): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.hairDataLayout,
      entries: [
        { binding: 0, resource: { buffer: this.hair.strandBuf } },
        { binding: 1, resource: { buffer: useBefore ? this.hair.beforeBuf : this.hair.styleBuf } },
        { binding: 2, resource: { buffer: this.hair.posBuf } },
      ],
    });
  }

  private writeFrame(camera: OrbitCamera, aspect: number, opts: RenderOpts) {
    const lightVP = this.lightMatrix(opts.lightDir);
    const viewProj = mat4Mul(camera.proj(aspect), camera.view());
    const data = new Float32Array(48);
    data.set(viewProj, 0);
    data.set(lightVP, 16);
    const eye = camera.eye();
    data.set([eye[0], eye[1], eye[2], 1], 32);
    data.set([opts.lightDir[0], opts.lightDir[1], opts.lightDir[2], opts.lightIntensity], 36);
    data.set([opts.ambient, opts.ambient, opts.ambient, opts.aoStrength], 40);
    data.set([opts.time, opts.hairWidthScale, 0.002, this.hair.count], 44);
    this.device.queue.writeBuffer(this.frameBuf, 0, data);
    this.device.queue.writeBuffer(this.lightBuf, 0, lightVP);
  }

  private encodeScene(pass: GPURenderPassEncoder, useBefore: boolean, drawHair: boolean) {
    const frameBg = this.frameBindGroup();
    if (this.vb && this.ib) {
      pass.setPipeline(this.meshPipe);
      pass.setBindGroup(0, frameBg);
      pass.setVertexBuffer(0, this.vb);
      pass.setIndexBuffer(this.ib, "uint32");
      pass.drawIndexed(this.indexCount);
    }
    if (drawHair && this.hair.count > 0) {
      pass.setPipeline(this.hairPipe);
      pass.setBindGroup(0, frameBg);
      pass.setBindGroup(1, this.hairBindGroup(useBefore));
      pass.draw(18 * this.hair.count);
    }
  }

  private encodeShadow(encoder: GPUCommandEncoder) {
    if (!this.vb || !this.ib) return;
    const pass = encoder.beginRenderPass({
      colorAttachments: [],
      depthStencilAttachment: {
        view: this.shadowView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });
    pass.setPipeline(this.shadowPipe);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.shadowPipe.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.lightBuf } }],
    }));
    pass.setVertexBuffer(0, this.vb);
    pass.setIndexBuffer(this.ib, "uint32");
    pass.drawIndexed(this.indexCount);
    pass.end();
  }

  render(camera: OrbitCamera, opts: RenderOpts) {
    this.gpu.resize();
    const { width, height } = this.gpu;
    this.writeFrame(camera, width / height, opts);
    const encoder = this.device.createCommandEncoder();
    this.encodeShadow(encoder);

    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.gpu.context.getCurrentTexture().createView(),
        clearValue: opts.clearColor,
        loadOp: "clear",
        storeOp: "store",
      }],
      depthStencilAttachment: {
        view: this.gpu.depthView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });
    if (opts.split) {
      const half = Math.floor(width / 2);
      pass.setViewport(0, 0, half, height, 0, 1);
      pass.setScissorRect(0, 0, half, height);
      this.encodeScene(pass, true, true);
      pass.setViewport(half, 0, width - half, height, 0, 1);
      pass.setScissorRect(half, 0, width - half, height);
      this.encodeScene(pass, false, true);
    } else {
      this.encodeScene(pass, false, true);
    }
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  // 离屏渲染一帧并读回像素,用于导出效果图
  async renderToPixels(camera: OrbitCamera, opts: RenderOpts, w: number, h: number): Promise<Uint8ClampedArray<ArrayBuffer>> {
    this.writeFrame(camera, w / h, opts);
    const tex = this.device.createTexture({
      size: [w, h],
      format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });
    const depth = this.device.createTexture({
      size: [w, h],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const encoder = this.device.createCommandEncoder();
    this.encodeShadow(encoder);
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: tex.createView(), clearValue: opts.clearColor, loadOp: "clear", storeOp: "store" }],
      depthStencilAttachment: { view: depth.createView(), depthClearValue: 1, depthLoadOp: "clear", depthStoreOp: "store" },
    });
    this.encodeScene(pass, false, true);
    pass.end();

    const bpr = Math.ceil((w * 4) / 256) * 256;
    const readBuf = this.device.createBuffer({ size: bpr * h, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    encoder.copyTextureToBuffer({ texture: tex }, { buffer: readBuf, bytesPerRow: bpr }, [w, h]);
    this.device.queue.submit([encoder.finish()]);
    await readBuf.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(readBuf.getMappedRange());
    const out = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) out.set(src.subarray(y * bpr, y * bpr + w * 4), y * w * 4);
    readBuf.unmap();
    readBuf.destroy();
    tex.destroy();
    depth.destroy();
    return out;
  }
}
