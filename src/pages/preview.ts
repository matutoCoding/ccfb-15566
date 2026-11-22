// 效果预览页:分屏对比、四视角、旋转展示、导出
import { App } from "../app";
import { REGIONS } from "../pet/breeds";
import { exportAngleSheet, exportLengthSheet } from "../export/exporter";
import { h, button, section } from "../ui/ui";

const VIEWS: [string, number][] = [
  ["正面", 0],
  ["背面", Math.PI],
  ["左侧", -Math.PI / 2],
  ["右侧", Math.PI / 2],
];

export const renderPreview = (root: HTMLElement, app: App) => {
  const panel = h("div", { className: "panel" },
    h("h2", {}, "效果预览"),
    h("p", { className: "sub" }, "分屏左侧为造型前基准,右侧为当前造型。可切换固定视角或自动旋转。"),
  );
  if (!app.profile) {
    panel.append(h("p", { className: "sub" }, "请先在「宠物档案」页选择或创建档案。"));
    root.append(panel);
    return;
  }

  const viewRow = h("div", { className: "btn-row" });
  for (const [name, yaw] of VIEWS) {
    viewRow.append(button(name, "", () => {
      app.autoRotate = false;
      app.camera.yaw = yaw;
      app.camera.pitch = 0.2;
    }));
  }
  panel.append(section("固定视角", viewRow));

  const rotateBtn = button("自动旋转:关", "block", () => {});
  rotateBtn.addEventListener("click", () => {
    app.autoRotate = !app.autoRotate;
    rotateBtn.textContent = `自动旋转:${app.autoRotate ? "开" : "关"}`;
  });
  const splitBtn = button("前后对比分屏:关", "block primary", () => {});
  splitBtn.addEventListener("click", () => {
    app.split = !app.split;
    splitBtn.textContent = `前后对比分屏:${app.split ? "开" : "关"}`;
  });
  panel.append(section("展示", splitBtn, h("div", { style: "height:8px" }), rotateBtn));

  const statsBox = h("div", {});
  const loadStats = async () => {
    const { avg, counts } = await app.hair.regionStats();
    const table = h("table", { className: "stat-table" },
      h("tr", {}, h("th", {}, "分区"), h("th", {}, "平均毛长"), h("th", {}, "发丝数")));
    REGIONS.forEach((name, i) => {
      if (counts[i] > 0) {
        table.append(h("tr", {},
          h("td", {}, name),
          h("td", {}, `${avg[i].toFixed(1)} mm`),
          h("td", {}, counts[i].toLocaleString()),
        ));
      }
    });
    statsBox.replaceChildren(table);
  };
  panel.append(section("长度分区",
    h("div", { className: "btn-row" }, button("刷新统计", "", () => { loadStats(); })),
    h("div", { style: "height:8px" }),
    statsBox,
  ));
  loadStats();

  panel.append(section("导出",
    h("div", { className: "btn-row" },
      button("四视角效果图", "primary", () => { exportAngleSheet(app); }),
      button("长度分区单 CSV", "", () => { exportLengthSheet(app); }),
    ),
    h("p", { className: "sub", style: "margin-top:12px" }, "效果图包含前/右/后/左四个角度;长度分区单可直接交给美容师按区下剪。"),
  ));
  root.append(panel);
};
