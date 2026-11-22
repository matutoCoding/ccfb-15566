// 毛发系统:发丝数据缓冲、物理模拟、笔刷/模板调度、撤销重做
import { HairRoot } from "../pet/mesh";
import { Breed } from "../pet/breeds";
import simWgsl from "../shaders/sim.wgsl?raw";
import brushWgsl from "../shaders/brush.wgsl?raw";
import templateWgsl from "../shaders/template.wgsl?raw";
import statsWgsl from "../shaders/region_stats.wgsl?raw";

export const STRAND_FLOATS = 8; // rootPos4 + normal4
export const STYLE_FLOATS = 16; // params4 + dir4 + colorRoot4 + colorTip4
export const POS_FLOATS = 32; // p16 + prev16
const MAX_COLLIDERS = 24;
const UNDO_DEPTH = 12;

export interface Collider {
  a: [number, number, number];
  b: [number, number, number];
  r: number;
}

export class HairSystem {
  private device: GPUDevice;
  count = 0;

  strandBuf!: GPUBuffer;
  styleBuf!: GPUBuffer;
  beforeBuf!: GPUBuffer; // 造型前快照,用于对比预览
  posBuf!: GPUBuffer;
  private colliderBuf: GPUBuffer;
  private simParamsBuf: GPUBuffer;
  private brushBuf: GPUBuffer;
  private templateBuf: GPUBuffer;
  private statsBuf: GPUBuffer;
  private statsReadBuf: GPUBuffer;

  private simPipe: GPUComputePipeline;
  private brushPipe: GPUComputePipeline;
  private templatePipe: GPUComputePipeline;
  private statsPipe: GPUComputePipeline;

  private undoStack: GPUBuffer[] = [];
  private redoStack: GPUBuffer[] = [];
  private pool: GPUBuffer[] = [];

  constructor(device: GPUDevice) {
    this.device = device;
    const storage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    this.colliderBuf = device.createBuffer({ size: MAX_COLLIDERS * 48, usage: storage });
    this.simParamsBuf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.brushBuf = device.createBuffer({ size: 96, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.templateBuf = device.createBuffer({ size: 16 * 16 + 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.statsBuf = device.createBuffer({ size: 32 * 4, usage: storage });
    this.statsReadBuf = device.createBuffer({ size: 32 * 4, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const compute = (code: string) =>
      device.createComputePipeline({
        layout: "auto",
        compute: { module: device.createShaderModule({ code }), entryPoint: "main" },
      });
    this.simPipe = compute(simWgsl);
    this.brushPipe = compute(brushWgsl);
    this.templatePipe = compute(templateWgsl);
    this.statsPipe = compute(statsWgsl);
  }

  // 植发:根据发根采样和品种毛发参数初始化全部缓冲
  plant(roots: HairRoot[], breed: Breed, hairScale: { length: number; thickness: number; curl: number; stiffness: number }) {
    this.count = roots.length;
    const d = this.device;
    this.strandBuf?.destroy();
    this.styleBuf?.destroy();
    this.beforeBuf?.destroy();
    this.posBuf?.destroy();
    for (const b of [...this.undoStack, ...this.redoStack, ...this.pool]) b.destroy();
    this.undoStack = [];
    this.redoStack = [];
    this.pool = [];

    const storage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    this.strandBuf = d.createBuffer({ size: this.count * STRAND_FLOATS * 4, usage: storage });
    this.styleBuf = d.createBuffer({ size: this.count * STYLE_FLOATS * 4, usage: storage });
    this.beforeBuf = d.createBuffer({ size: this.count * STYLE_FLOATS * 4, usage: storage });
    this.posBuf = d.createBuffer({ size: this.count * POS_FLOATS * 4, usage: storage });

    const strands = new Float32Array(this.count * STRAND_FLOATS);
    const styles = new Float32Array(this.count * STYLE_FLOATS);
    const pos = new Float32Array(this.count * POS_FLOATS);
    const [cr, cg, cb] = breed.color;
    for (let i = 0; i < this.count; i++) {
      const r = roots[i];
      const si = i * STRAND_FLOATS;
      strands[si] = r.pos[0]; strands[si + 1] = r.pos[1]; strands[si + 2] = r.pos[2];
      strands[si + 3] = r.region;
      strands[si + 4] = r.normal[0]; strands[si + 5] = r.normal[1]; strands[si + 6] = r.normal[2];
      strands[si + 7] = breed.hair.thickness * hairScale.thickness * (0.8 + Math.random() * 0.4);

      const yi = i * STYLE_FLOATS;
      const len = breed.hair.length * hairScale.length * (0.85 + Math.random() * 0.3);
      styles[yi] = len;
      styles[yi + 1] = Math.min(1, breed.hair.curl * hairScale.curl * (0.85 + Math.random() * 0.3));
      styles[yi + 2] = Math.min(1, breed.hair.stiffness * hairScale.stiffness);
      styles[yi + 3] = Math.random(); // 凌乱度种子
      styles[yi + 4] = r.normal[0]; styles[yi + 5] = r.normal[1]; styles[yi + 6] = r.normal[2];
      styles[yi + 7] = 0; // 梳理权重
      const shade = 0.9 + Math.random() * 0.2;
      styles[yi + 8] = cr * shade * 0.82; styles[yi + 9] = cg * shade * 0.82; styles[yi + 10] = cb * shade * 0.82;
      styles[yi + 11] = 1;
      styles[yi + 12] = cr * shade; styles[yi + 13] = cg * shade; styles[yi + 14] = cb * shade;
      styles[yi + 15] = 1;

      // 初始位置沿法线展开
      const pi = i * POS_FLOATS;
      const seg = len / 3;
      for (let j = 0; j < 4; j++) {
        const px = r.pos[0] + r.normal[0] * seg * j;
        const py = r.pos[1] + r.normal[1] * seg * j;
        const pz = r.pos[2] + r.normal[2] * seg * j;
        pos[pi + j * 4] = px; pos[pi + j * 4 + 1] = py; pos[pi + j * 4 + 2] = pz; pos[pi + j * 4 + 3] = 1;
        pos[pi + 16 + j * 4] = px; pos[pi + 16 + j * 4 + 1] = py; pos[pi + 16 + j * 4 + 2] = pz; pos[pi + 16 + j * 4 + 3] = 1;
      }
    }
    d.queue.writeBuffer(this.strandBuf, 0, strands);
    d.queue.writeBuffer(this.styleBuf, 0, styles);
    d.queue.writeBuffer(this.posBuf, 0, pos);
    this.copyStyle(this.styleBuf, this.beforeBuf);
  }

  updateColliders(colliders: Collider[]) {
    const data = new Float32Array(MAX_COLLIDERS * 12);
    colliders.slice(0, MAX_COLLIDERS).forEach((c, i) => {
      const o = i * 12;
      data[o] = c.a[0]; data[o + 1] = c.a[1]; data[o + 2] = c.a[2]; data[o + 3] = 0;
      data[o + 4] = c.b[0]; data[o + 5] = c.b[1]; data[o + 6] = c.b[2]; data[o + 7] = 0;
      data[o + 8] = c.r;
    });
    this.device.queue.writeBuffer(this.colliderBuf, 0, data);
  }

  private copyStyle(src: GPUBuffer, dst: GPUBuffer) {
    const enc = this.device.createCommandEncoder();
    enc.copyBufferToBuffer(src, 0, dst, 0, this.count * STYLE_FLOATS * 4);
    this.device.queue.submit([enc.finish()]);
  }

  private allocSnap(): GPUBuffer {
    return (
      this.pool.pop() ??
      this.device.createBuffer({
        size: this.count * STYLE_FLOATS * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      })
    );
  }

  // 笔画开始时调用,记录撤销点
  snapshot() {
    const buf = this.allocSnap();
    this.copyStyle(this.styleBuf, buf);
    this.undoStack.push(buf);
    if (this.undoStack.length > UNDO_DEPTH) this.pool.push(this.undoStack.shift()!);
    for (const b of this.redoStack) this.pool.push(b);
    this.redoStack = [];
  }

  undo(): boolean {
    const buf = this.undoStack.pop();
    if (!buf) return false;
    const cur = this.allocSnap();
    this.copyStyle(this.styleBuf, cur);
    this.redoStack.push(cur);
    this.copyStyle(buf, this.styleBuf);
    this.pool.push(buf);
    return true;
  }

  redo(): boolean {
    const buf = this.redoStack.pop();
    if (!buf) return false;
    const cur = this.allocSnap();
    this.copyStyle(this.styleBuf, cur);
    this.undoStack.push(cur);
    this.copyStyle(buf, this.styleBuf);
    this.pool.push(buf);
    return true;
  }

  // 把当前造型保存为"造型前"基准(用于对比)
  markBefore() {
    this.copyStyle(this.styleBuf, this.beforeBuf);
  }

  // 每帧物理模拟
  simulate(encoder: GPUCommandEncoder, dt: number, gravity: number, damping: number, iterations: number, colliderCount: number, time: number) {
    if (!this.count) return;
    this.device.queue.writeBuffer(this.simParamsBuf, 0, new Float32Array([dt, gravity, damping, iterations]));
    this.device.queue.writeBuffer(this.simParamsBuf, 16, new Uint32Array([this.count, colliderCount]));
    this.device.queue.writeBuffer(this.simParamsBuf, 24, new Float32Array([time]));
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.simPipe);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.simPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.simParamsBuf } },
        { binding: 1, resource: { buffer: this.colliderBuf } },
        { binding: 2, resource: { buffer: this.strandBuf } },
        { binding: 3, resource: { buffer: this.styleBuf } },
        { binding: 4, resource: { buffer: this.posBuf } },
      ],
    }));
    pass.dispatchWorkgroups(Math.ceil(this.count / 64));
    pass.end();
  }

  // 应用一次笔刷
  applyBrush(encoder: GPUCommandEncoder, tool: number, pos: [number, number, number], radius: number, value: number, strength: number, regionMask: number, dir: [number, number, number], color0: number[], color1: number[]) {
    if (!this.count) return;
    const data = new Float32Array(24);
    data.set([pos[0], pos[1], pos[2], radius], 0);
    data.set([tool, value, strength, regionMask], 4);
    data.set([dir[0], dir[1], dir[2], 0], 8);
    data.set([color0[0], color0[1], color0[2], 1], 12);
    data.set([color1[0], color1[1], color1[2], 1], 16);
    this.device.queue.writeBuffer(this.brushBuf, 0, data);
    this.device.queue.writeBuffer(this.brushBuf, 80, new Uint32Array([this.count, 0, 0, 0]));
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.brushPipe);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.brushPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.brushBuf } },
        { binding: 1, resource: { buffer: this.strandBuf } },
        { binding: 2, resource: { buffer: this.styleBuf } },
      ],
    }));
    pass.dispatchWorkgroups(Math.ceil(this.count / 64));
    pass.end();
  }

  // 套用模板:regions 为 16 组 [目标长度, 卷曲倍率, 混合度, 刚度倍率]
  applyTemplate(encoder: GPUCommandEncoder, regions: Float32Array<ArrayBuffer>) {
    if (!this.count) return;
    this.device.queue.writeBuffer(this.templateBuf, 0, regions);
    this.device.queue.writeBuffer(this.templateBuf, 256, new Uint32Array([this.count, 0, 0, 0]));
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.templatePipe);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.templatePipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.templateBuf } },
        { binding: 1, resource: { buffer: this.strandBuf } },
        { binding: 2, resource: { buffer: this.styleBuf } },
      ],
    }));
    pass.dispatchWorkgroups(Math.ceil(this.count / 64));
    pass.end();
  }

  // 分区平均毛长统计(毫米)
  async regionStats(): Promise<{ avg: number[]; counts: number[] }> {
    const zero = new Uint32Array(32);
    this.device.queue.writeBuffer(this.statsBuf, 0, zero);
    const enc = this.device.createCommandEncoder();
    this.device.queue.writeBuffer(this.brushBuf, 0, new Uint32Array([this.count, 0, 0, 0]));
    const pass = enc.beginComputePass();
    pass.setPipeline(this.statsPipe);
    pass.setBindGroup(0, this.device.createBindGroup({
      layout: this.statsPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.brushBuf } },
        { binding: 1, resource: { buffer: this.strandBuf } },
        { binding: 2, resource: { buffer: this.styleBuf } },
        { binding: 3, resource: { buffer: this.statsBuf } },
      ],
    }));
    pass.dispatchWorkgroups(Math.ceil(this.count / 64));
    pass.end();
    enc.copyBufferToBuffer(this.statsBuf, 0, this.statsReadBuf, 0, 128);
    this.device.queue.submit([enc.finish()]);
    await this.statsReadBuf.mapAsync(GPUMapMode.READ);
    const data = new Uint32Array(this.statsReadBuf.getMappedRange().slice(0));
    this.statsReadBuf.unmap();
    const avg: number[] = [];
    const counts: number[] = [];
    for (let i = 0; i < 16; i++) {
      const c = data[16 + i];
      counts.push(c);
      avg.push(c > 0 ? data[i] / c : 0); // 毫米
    }
    return { avg, counts };
  }
}
