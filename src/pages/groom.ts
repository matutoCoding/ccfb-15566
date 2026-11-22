// 毛发造型页:剪刀/推子/梳子 + 模板 + 撤销重做
import { App } from "../app";
import { REGIONS } from "../pet/breeds";
import { TEMPLATES } from "../state/groom_templates";
import { h, button, slider, section, toast, ICONS, svgIcon } from "../ui/ui";

const GUARDS = [3, 6, 9, 13]; // 推子刀头 mm

export const renderGroom = (root: HTMLElement, app: App) => {
  const panel = h("div", { className: "panel" },
    h("h2", {}, "毛发造型"),
    h("p", { className: "sub" }, "左键在模型上刷动造型,Shift+左键或右键旋转视角,滚轮缩放。"),
  );
  if (!app.profile) {
    panel.append(h("p", { className: "sub" }, "请先在「宠物档案」页选择或创建档案。"));
    root.append(panel);
    return;
  }

  // 工具选择
  const tools: { id: number; name: string; icon: string }[] = [
    { id: 0, name: "剪刀", icon: ICONS.scissors },
    { id: 1, name: "推子", icon: ICONS.clipper },
    { id: 2, name: "梳子", icon: ICONS.comb },
  ];
  const toolGrid = h("div", { className: "tool-grid" });
  const toolSection = h("div", {});
  const rebuildToolOptions = () => {
    toolSection.replaceChildren();
    const t = app.tool;
    if (t.tool === 0) {
      toolSection.append(slider("单次剪掉量", 0.2, 3, 0.1, t.value, (v) => { t.value = v; }, (v) => `${(v * 10).toFixed(0)} mm`));
    } else if (t.tool === 1) {
      const row = h("div", { className: "btn-row" });
      for (const g of GUARDS) {
        const b = button(`${g}mm`, Math.abs(t.value * 10 - g) < 0.01 ? "primary" : "", () => {
          t.value = g / 10;
          rebuildToolOptions();
        });
        row.append(b);
      }
      toolSection.append(h("div", { className: "field" }, h("label", {}, "刀头规格"), row));
    } else {
      toolSection.append(slider("梳理强度", 0.1, 1, 0.05, t.strength, (v) => { t.strength = v; }, (v) => `${(v * 100).toFixed(0)}%`));
    }
  };
  const refreshToolGrid = () => {
    toolGrid.replaceChildren();
    for (const t of tools) {
      const b = h("button", { className: `tool-btn${app.tool.tool === t.id ? " active" : ""}`, type: "button" },
        svgIcon(t.icon), t.name);
      b.addEventListener("click", () => {
        app.tool.tool = t.id;
        refreshToolGrid();
        rebuildToolOptions();
      });
      toolGrid.append(b);
    }
  };
  refreshToolGrid();
  rebuildToolOptions();
  panel.append(section("造型工具", toolGrid, toolSection));

  // 笔刷
  const regionSelect = h("select", {},
    h("option", { value: "-1" }, "全部区域"),
    ...REGIONS.map((name, i) => h("option", { value: String(i) }, name)),
  ) as HTMLSelectElement;
  regionSelect.addEventListener("change", () => { app.tool.regionMask = parseInt(regionSelect.value, 10); });
  panel.append(section("笔刷",
    slider("笔刷半径", 1, 8, 0.5, app.tool.radius, (v) => { app.tool.radius = v; }, (v) => `${v.toFixed(1)} cm`),
    h("div", { className: "field" }, h("label", {}, "作用区域"), regionSelect),
  ));

  // 模板
  const tmplGrid = h("div", { className: "tmpl-grid" });
  for (const t of TEMPLATES) {
    const card = h("div", {
      className: `tmpl-card${app.profile.templateId === t.id ? " active" : ""}`,
    }, h("div", { className: "name" }, t.name), h("div", { className: "desc" }, t.desc));
    card.addEventListener("click", () => {
      app.applyTemplate(t.id);
      tmplGrid.querySelectorAll(".tmpl-card").forEach((el) => el.classList.remove("active"));
      card.classList.add("active");
      toast(`已套用「${t.name}」,可继续微调`);
    });
    tmplGrid.append(card);
  }
  panel.append(section("造型模板", tmplGrid));

  // 操作
  panel.append(section("操作",
    h("div", { className: "btn-row" },
      button("撤销", "", () => app.undo()),
      button("重做", "", () => app.redo()),
    ),
    h("div", { style: "height:8px" }),
    h("div", { className: "btn-row" },
      button("保存为造型基准", "primary", () => {
        app.markBefore();
        toast("已保存,预览页可对比造型前后");
      }),
    ),
  ));
  root.append(panel);
};
