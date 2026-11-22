// 体型编辑页:四肢与头身比例调节,实时重建
import { App } from "../app";
import { h, slider, section } from "../ui/ui";

export const renderBody = (root: HTMLElement, app: App) => {
  const p = app.profile;
  const panel = h("div", { className: "panel" },
    h("h2", {}, "体型编辑"),
    h("p", { className: "sub" }, p
      ? `调整「${p.name}」的四肢与头身比例,模型与毛发会实时重建,已有造型尽量保留。`
      : "请先在「宠物档案」页选择或创建档案。"),
  );
  if (!p) {
    root.append(panel);
    return;
  }

  let timer = 0;
  const rebuild = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => app.rebuild(), 120);
  };

  const body = p.body;
  panel.append(section("躯干",
    slider("躯干长度", 18, 40, 0.5, body.bodyLen, (v) => { body.bodyLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("躯干围度", 6, 13, 0.1, body.girth, (v) => { body.girth = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("颈部长度", 2, 10, 0.5, body.neckLen, (v) => { body.neckLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
  ));
  panel.append(section("头部",
    slider("头部大小", 0.7, 1.4, 0.02, body.headScale, (v) => { body.headScale = v; rebuild(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("吻部长度", 2, 9, 0.1, body.muzzleLen, (v) => { body.muzzleLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("耳朵长度", 3, 11, 0.1, body.earLen, (v) => { body.earLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("耳朵下垂度", 0, 1, 0.05, body.earDroop, (v) => { body.earDroop = v; rebuild(); }, (v) => v < 0.4 ? "立耳" : v < 0.7 ? "半垂" : "垂耳"),
  ));
  panel.append(section("四肢与尾巴",
    slider("腿部长度", 8, 22, 0.5, body.legLen, (v) => { body.legLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("腿部粗细", 1.5, 3.5, 0.1, body.legR, (v) => { body.legR = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
    slider("尾巴长度", 2, 12, 0.5, body.tailLen, (v) => { body.tailLen = v; rebuild(); }, (v) => `${v.toFixed(1)} cm`),
  ));
  panel.append(section("毛发基础",
    slider("整体毛长倍率", 0.5, 2, 0.05, p.hairScale.length, (v) => { p.hairScale.length = v; rebuild(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("毛发粗细倍率", 0.5, 2, 0.05, p.hairScale.thickness, (v) => { p.hairScale.thickness = v; rebuild(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("卷曲度倍率", 0.2, 2, 0.05, p.hairScale.curl, (v) => { p.hairScale.curl = v; rebuild(); }, (v) => `${(v * 100).toFixed(0)}%`),
    slider("硬度倍率", 0.2, 2, 0.05, p.hairScale.stiffness, (v) => { p.hairScale.stiffness = v; rebuild(); }, (v) => `${(v * 100).toFixed(0)}%`),
  ));
  root.append(panel);
};
