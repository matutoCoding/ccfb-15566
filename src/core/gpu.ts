// WebGPU 设备上下文单例
export interface GpuCtx {
  device: GPUDevice;
  context: GPUCanvasContext;
  canvas: HTMLCanvasElement;
  format: GPUTextureFormat;
  depthView: GPUTextureView;
  width: number;
  height: number;
  resize: () => void;
}

export const initGpu = async (canvas: HTMLCanvasElement): Promise<GpuCtx> => {
  if (!navigator.gpu) throw new Error("当前浏览器不支持 WebGPU,请使用 Chrome 113+ / Edge 113+");
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("未找到可用的 GPU 适配器");
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "opaque" });

  let depthTexture: GPUTexture | null = null;
  let width = 0;
  let height = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (w === width && h === height && depthTexture) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    depthTexture?.destroy();
    depthTexture = device.createTexture({
      size: [w, h],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  };
  resize();

  return {
    device,
    context,
    canvas,
    format,
    get depthView() {
      return depthTexture!.createView();
    },
    get width() {
      return width;
    },
    get height() {
      return height;
    },
    resize,
  };
};
