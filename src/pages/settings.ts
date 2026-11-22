// 设置页:发丝数量、模拟质量、光照与显示
import { App } from "../app";
import { h, slider, section, toast } from "../ui/ui";

const COUNTS = [50000, 100000, 200000, 300000];

export const renderSettings = (root: HTMLElement, app: App) => {
  const s = app.settings;
  const panel = h("div", { className: "panel" },
    h("h2", {}, "设置"),
    h("p", { className: "sub" }, "调整毛发规模与渲染质量。修改发丝数量后会重新植发,当前造型将按模板重置。"),
  );

  const countSelect = h("select", {},
    ...COUNTS.map((c) => h("option", { value: String(c), ...(s.strandCount === c ? { selected: "" } : {}) },
      `${(c / 10000).toFixed(0)} 万根`)),
  ) as HTMLSelectElement;
  countSelect.addEventListener("change", () => {
    s.strandCount = parseInt(countSelect.value, 10);
    app.persist();
    app.rebuild();
    toast(`已切换为 ${(s.strandCount / 10000).toFixed(0)} 万根发丝`);
  });
  panel.append(section("毛发规模",
    h("div", { className: "field" }, h("label", {}, "发丝数量(30 万为目标性能档)"), countSelect),
    slider("物理迭代次数", 1, 4, 1, s.iterations, (v) => { s.iterations = v; app.persist(); }, (v) => `${v} 次`),
    slider("重力强度", 0, 600, 10, s.gravity, (v) => { s.gravity = v; app.persist(); }, (v) => `${v.toFixed(0)}`),
  ));

  panel.append(section("渲染质量",
    slider("发丝宽度", 0.5, 2.5, 0.1, s.hairWidth, (v) => { s.hairWidth = v; app.persist(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("自阴影强度", 0, 1, 0.05, s.aoStrength, (v) => { s.aoStrength = v; app.persist(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("光照强度", 0.2, 2, 0.05, s.lightIntensity, (v) => { s.lightIntensity = v; app.persist(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("环境光", 0.1, 0.8, 0.05, s.ambient, (v) => { s.ambient = v; app.persist(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("光源方向", 0, 6.28, 0.05, s.lightYaw, (v) => { s.lightYaw = v; app.persist(); }, (v) => `${(v * 57.3).toFixed(0)}°`),
    slider("光源高度", 0.2, 1.5, 0.05, s.lightPitch, (v) => { s.lightPitch = v; app.persist(); }, (v) => `${(v * 57.3).toFixed(0)}°`),
  ));

  const bgInput = h("input", { type: "color", value: s.bg }) as HTMLInputElement;
  bgInput.addEventListener("input", () => { s.bg = bgInput.value; app.persist(); });
  const fpsToggle = h("select", {},
    h("option", { value: "1", ...(s.showFps ? { selected: "" } : {}) }, "显示"),
    h("option", { value: "0", ...(s.showFps ? {} : { selected: "" }) }, "隐藏"),
  ) as HTMLSelectElement;
  fpsToggle.addEventListener("change", () => {
    s.showFps = fpsToggle.value === "1";
    app.persist();
    app.onChange?.();
  });
  panel.append(section("显示",
    h("div", { className: "field" }, h("label", {}, "背景色"), bgInput),
    h("div", { className: "field" }, h("label", {}, "帧率角标"), fpsToggle),
  ));
  root.append(panel);
};
