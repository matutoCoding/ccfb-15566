// 入口:路由、导航、FPS 角标
import "./ui/style.css";
import { App, PageId } from "./app";
import { renderProfiles } from "./pages/profiles";
import { renderBody } from "./pages/body";
import { renderGroom } from "./pages/groom";
import { renderDye } from "./pages/dye";
import { renderPreview } from "./pages/preview";
import { renderSettings } from "./pages/settings";
import { h } from "./ui/ui";

const NAV: [PageId, string][] = [
  ["profiles", "宠物档案"],
  ["body", "体型编辑"],
  ["groom", "毛发造型"],
  ["dye", "染色"],
  ["preview", "效果预览"],
  ["settings", "设置"],
];

const RENDERERS: Record<PageId, (root: HTMLElement, app: App) => void> = {
  profiles: renderProfiles,
  body: renderBody,
  groom: renderGroom,
  dye: renderDye,
  preview: renderPreview,
  settings: renderSettings,
};

const boot = async () => {
  const rootEl = document.getElementById("app")!;
  const canvas = h("canvas", { id: "scene-canvas" }) as HTMLCanvasElement;
  const nav = h("nav", { className: "topbar" });
  const panelRoot = h("div", { id: "panel-root" });
  const fpsBadge = h("div", { className: "fps-badge" }, "-- FPS");
  const hintBar = h("div", { className: "hint-bar" }, "左键造型 · Shift+左键/右键旋转 · 滚轮缩放");
  rootEl.append(canvas, nav, panelRoot, fpsBadge, hintBar);

  const app = new App();
  try {
    await app.init(canvas);
  } catch (err) {
    rootEl.append(h("div", { className: "panel" },
      h("h2", {}, "无法启动"),
      h("p", { className: "sub" }, err instanceof Error ? err.message : "WebGPU 初始化失败"),
    ));
    return;
  }

  const currentPage = (): PageId => {
    const hash = location.hash.replace("#/", "") as PageId;
    return NAV.some(([id]) => id === hash) ? hash : "profiles";
  };

  const renderPage = () => {
    const page = currentPage();
    app.page = page;
    app.split = page === "preview" ? app.split : false;
    nav.replaceChildren(...NAV.map(([id, name]) =>
      h("a", { href: `#/${id}`, className: id === page ? "active" : "" }, name),
    ));
    panelRoot.replaceChildren();
    RENDERERS[page](panelRoot, app);
    fpsBadge.style.display = app.settings.showFps ? "" : "none";
    hintBar.style.display = page === "groom" || page === "dye" ? "" : "none";
  };

  app.onFps = (fps) => {
    if (!app.settings.showFps) return;
    const ok = fps >= 30;
    fpsBadge.innerHTML = `<span class="${ok ? "ok" : "bad"}">${fps.toFixed(0)}</span> FPS · ${(app.hair.count / 10000).toFixed(0)}万根`;
  };
  app.onChange = () => { /* 档案变更时页面自行刷新 */ };

  window.addEventListener("hashchange", renderPage);
  renderPage();
};

boot();
