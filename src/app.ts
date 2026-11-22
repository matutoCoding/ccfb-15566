// 场景调度:模型重建、毛发模拟、笔刷输入、渲染循环、撤销重做
import { initGpu, GpuCtx } from "./core/gpu";
import { OrbitCamera } from "./core/camera";
import { Vec3, norm, sub } from "./core/math";
import { BREEDS } from "./pet/breeds";
import { buildParts, buildMesh, sampleHairRoots, raycastParts, Part } from "./pet/mesh";
import { HairSystem } from "./hair/hair_system";
import { Renderer } from "./hair/renderer";
import { Profile, Settings, GroomStroke, loadSettings, saveSettings, loadProfiles, saveProfiles } from "./state/store";
import { TEMPLATES, templateRegions } from "./state/groom_templates";

export type PageId = "profiles" | "body" | "groom" | "dye" | "preview" | "settings";

export interface ToolState {
  tool: number; // 0剪刀 1推子 2梳子 3染色
  radius: number;
  value: number; // 剪刀剪掉量cm / 推子刀头cm
  strength: number;
  regionMask: number; // -1 全部
  color0: number[];
  color1: number[];
}

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export class App {
  gpu!: GpuCtx;
  camera = new OrbitCamera();
  hair!: HairSystem;
  renderer!: Renderer;
  settings: Settings = loadSettings();
  profiles: Profile[] = loadProfiles();
  profile: Profile | null = null;
  parts: Part[] = [];
  page: PageId = "profiles";
  tool: ToolState = { tool: 1, radius: 3, value: 0.3, strength: 1, regionMask: -1, color0: [0.8, 0.2, 0.2], color1: [0.9, 0.5, 0.1] };
  split = false;
  autoRotate = false;
  fps = 0;
  onFps: ((fps: number) => void) | null = null;
  onChange: (() => void) | null = null;

  private painting = false;
  private lastHit: Vec3 | null = null;
  private strokeDirty = false;

  async init(canvas: HTMLCanvasElement) {
    this.gpu = await initGpu(canvas);
    this.hair = new HairSystem(this.gpu.device);
    this.renderer = new Renderer(this.gpu, this.hair);
    this.bindInput(canvas);
    if (this.profiles.length > 0) this.setProfile(this.profiles[0]);
    requestAnimationFrame(this.loop);
  }

  persist() {
    saveProfiles(this.profiles);
    saveSettings(this.settings);
  }

  setProfile(p: Profile) {
    this.profile = p;
    if (!this.profiles.find((x) => x.id === p.id)) {
      this.profiles.push(p);
      this.persist();
    }
    this.rebuild();
  }

  // 由档案重建模型与毛发,并重放模板和细调笔画
  rebuild() {
    const p = this.profile;
    if (!p) return;
    const breed = BREEDS[p.breed];
    this.parts = buildParts(p.body);
    const model = buildMesh(this.parts);
    this.renderer.setMesh(model);
    let seed = 0;
    for (const ch of p.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const roots = sampleHairRoots(this.parts, this.settings.strandCount, seed);
    this.hair.plant(roots, breed, p.hairScale);
    this.hair.updateColliders(this.parts.map((pt) => ({ a: pt.a, b: pt.b, r: pt.r })));
    const enc = this.gpu.device.createCommandEncoder();
    const tmpl = TEMPLATES.find((t) => t.id === p.templateId) ?? TEMPLATES[0];
    this.hair.applyTemplate(enc, templateRegions(tmpl));
    this.gpu.device.queue.submit([enc.finish()]);
    for (const s of p.strokes.slice(-400)) this.replayStroke(s);
    this.hair.markBefore();
    this.onChange?.();
  }

  private replayStroke(s: GroomStroke) {
    const enc = this.gpu.device.createCommandEncoder();
    this.hair.applyBrush(enc, s.t, s.p, s.r, s.v, s.s, s.m, s.g, s.c0, s.c1);
    this.gpu.device.queue.submit([enc.finish()]);
  }

  applyTemplate(id: string) {
    const p = this.profile;
    if (!p) return;
    p.templateId = id;
    this.hair.snapshot();
    const tmpl = TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      const enc = this.gpu.device.createCommandEncoder();
      this.hair.applyTemplate(enc, templateRegions(tmpl));
      this.gpu.device.queue.submit([enc.finish()]);
    }
    this.touch();
  }

  undo() {
    if (this.hair.undo()) {
      this.profile?.strokes.pop();
      this.onChange?.();
    }
  }

  redo() {
    if (this.hair.redo()) this.onChange?.();
  }

  private touch() {
    if (this.profile) this.profile.updatedAt = new Date().toISOString();
    this.persist();
    this.onChange?.();
  }

  // 保存当前造型为"造型前"基准
  markBefore() {
    this.hair.markBefore();
    this.touch();
  }

  private bindInput(canvas: HTMLCanvasElement) {
    let rotating = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId);
      lastX = e.clientX;
      lastY = e.clientY;
      const paintable = this.page === "groom" || this.page === "dye";
      if (paintable && e.button === 0 && !e.shiftKey && this.profile) {
        this.painting = true;
        this.hair.snapshot();
        this.paintAt(e, null);
      } else {
        rotating = true;
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (this.painting) {
        this.paintAt(e, [dx, dy]);
      } else if (rotating) {
        this.camera.yaw -= dx * 0.008;
        this.camera.pitch = Math.max(-1.4, Math.min(1.4, this.camera.pitch + dy * 0.008));
      }
    });
    const stop = () => {
      if (this.painting && this.strokeDirty) {
        this.strokeDirty = false;
        this.touch();
      }
      this.painting = false;
      rotating = false;
      this.lastHit = null;
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.camera.dist = Math.max(30, Math.min(300, this.camera.dist * (1 + e.deltaY * 0.001)));
    }, { passive: false });
  }

  private paintAt(e: PointerEvent, dragDelta: [number, number] | null) {
    const rect = this.gpu.canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    const { ro, rd } = this.camera.ray(nx, ny, rect.width / rect.height);
    const hit = raycastParts(this.parts, ro, rd);
    if (!hit) return;
    const t = this.tool;
    const tool = this.page === "dye" ? 3 : t.tool;
    // 梳子方向:优先用命中点移动方向,其次屏幕拖拽映射到相机右向
    let dir: Vec3 = [0, -1, 0];
    if (this.lastHit) dir = norm(sub(hit.point, this.lastHit));
    else if (dragDelta) {
      const r = this.camera.right();
      dir = norm([r[0] * dragDelta[0], -dragDelta[1], r[2] * dragDelta[0]]);
    }
    this.lastHit = hit.point;

    const stroke: GroomStroke = {
      p: hit.point, g: dir, t: tool, r: t.radius, v: t.value,
      s: t.strength, m: t.regionMask, c0: t.color0, c1: t.color1,
    };
    this.profile?.strokes.push(stroke);
    if (this.profile && this.profile.strokes.length > 400) this.profile.strokes.shift();
    const enc = this.gpu.device.createCommandEncoder();
    this.hair.applyBrush(enc, tool, hit.point, t.radius, t.value, t.strength, t.regionMask, dir, t.color0, t.color1);
    this.gpu.device.queue.submit([enc.finish()]);
    this.strokeDirty = true;
  }

  private last = performance.now();
  private loop = (now: number) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.fps = this.fps * 0.92 + (1 / Math.max(dt, 1e-4)) * 0.08;
    this.onFps?.(this.fps);
    if (this.autoRotate) this.camera.yaw += dt * 0.5;

    const s = this.settings;
    const enc = this.gpu.device.createCommandEncoder();
    this.hair.simulate(enc, dt, s.gravity, 0.96, s.iterations, this.parts.length, now / 1000);
    this.gpu.device.queue.submit([enc.finish()]);

    const cp = Math.cos(s.lightPitch);
    const lightDir: Vec3 = norm([cp * Math.sin(s.lightYaw), -Math.sin(s.lightPitch), cp * Math.cos(s.lightYaw)]);
    this.renderer.render(this.camera, {
      time: now / 1000,
      lightDir,
      lightIntensity: s.lightIntensity,
      ambient: s.ambient,
      aoStrength: s.aoStrength,
      hairWidthScale: s.hairWidth,
      split: this.page === "preview" && this.split,
      clearColor: this.bgColor(),
    });
    requestAnimationFrame(this.loop);
  };

  bgColor(): GPUColor {
    const [r, g, b] = hexToRgb(this.settings.bg);
    return { r, g, b, a: 1 };
  }
}
