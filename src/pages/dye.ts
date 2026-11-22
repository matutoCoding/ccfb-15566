// 染色页:分区刷染,毛根毛尖双色渐变
import { App } from "../app";
import { REGIONS } from "../pet/breeds";
import { h, slider, section, button, toast, rgbToHex, hexToRgbArr } from "../ui/ui";

const PRESETS: [string, string, string][] = [
  // [名字, 毛根色, 毛尖色]
  ["樱花粉", "#e88aa5", "#f7d6e0"],
  ["雾霾蓝", "#5b7fa6", "#b8d0e8"],
  ["焦糖渐变", "#8a5a2e", "#d9a05b"],
  ["薄藤紫", "#8a6cae", "#d3c2e8"],
  ["奶油白金", "#c9b189", "#f2e8d5"],
  ["墨黑挑染", "#2b2b30", "#6e6e78"],
];

export const renderDye = (root: HTMLElement, app: App) => {
  const panel = h("div", { className: "panel" },
    h("h2", {}, "染色"),
    h("p", { className: "sub" }, "左键在模型上刷染,毛根毛尖可分别设色形成渐变。Shift+左键旋转视角。"),
  );
  if (!app.profile) {
    panel.append(h("p", { className: "sub" }, "请先在「宠物档案」页选择或创建档案。"));
    root.append(panel);
    return;
  }

  const colorField = (label: string, get: () => number[], set: (c: number[]) => void): HTMLElement => {
    const input = h("input", { type: "color", value: rgbToHex(get()) }) as HTMLInputElement;
    input.addEventListener("input", () => set(hexToRgbArr(input.value)));
    return h("div", { className: "field" }, h("label", {}, label), input);
  };

  panel.append(section("颜色",
    colorField("毛根色", () => app.tool.color0, (c) => { app.tool.color0 = c; }),
    colorField("毛尖色", () => app.tool.color1, (c) => { app.tool.color1 = c; }),
  ));

  const presetGrid = h("div", { className: "tmpl-grid" });
  for (const [name, c0, c1] of PRESETS) {
    const card = h("div", { className: "tmpl-card" },
      h("div", { className: "name" }, name),
      h("div", {
        style: `height:14px;border-radius:4px;margin-top:4px;background:linear-gradient(90deg,${c0},${c1})`,
      }),
    );
    card.addEventListener("click", () => {
      app.tool.color0 = hexToRgbArr(c0);
      app.tool.color1 = hexToRgbArr(c1);
      toast(`已选「${name}」,在模型上刷染`);
    });
    presetGrid.append(card);
  }
  panel.append(section("流行色板", presetGrid));

  const regionSelect = h("select", {},
    h("option", { value: "-1" }, "全部区域"),
    ...REGIONS.map((name, i) => h("option", { value: String(i) }, name)),
  ) as HTMLSelectElement;
  regionSelect.addEventListener("change", () => { app.tool.regionMask = parseInt(regionSelect.value, 10); });

  panel.append(section("笔刷",
    slider("笔刷半径", 1, 8, 0.5, app.tool.radius, (v) => { app.tool.radius = v; }, (v) => `${v.toFixed(1)} cm`),
    slider("染色强度", 0.1, 1, 0.05, app.tool.strength, (v) => { app.tool.strength = v; }, (v) => `${(v * 100).toFixed(0)}%`),
    h("div", { className: "field" }, h("label", {}, "作用区域"), regionSelect),
  ));

  panel.append(section("操作",
    h("div", { className: "btn-row" },
      button("撤销", "", () => app.undo()),
      button("重做", "", () => app.redo()),
    ),
    h("div", { style: "height:8px" }),
    button("恢复原毛色", "block", () => {
      const p = app.profile;
      if (!p) return;
      app.hair.snapshot();
      const enc = app.gpu.device.createCommandEncoder();
      // 用染色笔刷把全部区域刷回原色
      app.hair.applyBrush(enc, 3, [0, 15, 0], 200, 0, 1, -1, [0, -1, 0],
        [...p.rootColor], [...p.tipColor]);
      app.gpu.device.queue.submit([enc.finish()]);
      toast("已恢复原毛色");
    }),
  ));
  root.append(panel);
};
