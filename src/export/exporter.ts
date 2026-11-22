// 导出:四视角效果图(2x2 拼图 PNG) + 美容师长度分区单(CSV)
import { App } from "../app";
import { REGIONS } from "../pet/breeds";
import { toast } from "../ui/ui";

const download = (url: string, name: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// 前/右/后/左 四视角拼成一张效果图
export const exportAngleSheet = async (app: App) => {
  const views: [string, number][] = [
    ["正面", 0],
    ["右侧", Math.PI / 2],
    ["背面", Math.PI],
    ["左侧", -Math.PI / 2],
  ];
  const W = 800;
  const H = 600;
  const savedYaw = app.camera.yaw;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2 + 96;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < views.length; i++) {
    app.camera.yaw = views[i][1];
    const pixels = await app.renderer.renderToPixels(app.camera, {
      time: performance.now() / 1000,
      lightDir: [0.4, -0.8, 0.3],
      lightIntensity: app.settings.lightIntensity,
      ambient: app.settings.ambient,
      aoStrength: app.settings.aoStrength,
      hairWidthScale: app.settings.hairWidth,
      clearColor: app.bgColor(),
    }, W, H);
    const img = new ImageData(pixels, W, H);
    const tmp = document.createElement("canvas");
    tmp.width = W;
    tmp.height = H;
    tmp.getContext("2d")!.putImageData(img, 0, 0);
    const x = (i % 2) * W;
    const y = Math.floor(i / 2) * H + 48;
    ctx.drawImage(tmp, x, y);
    ctx.fillStyle = "#334155";
    ctx.font = "28px sans-serif";
    ctx.fillText(views[i][0], x + 16, y + 38);
  }
  app.camera.yaw = savedYaw;

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(`${app.profile?.name ?? "宠物"} 造型效果图`, 16, 34);
  canvas.toBlob((blob) => {
    if (blob) download(URL.createObjectURL(blob), `${app.profile?.name ?? "pet"}-四视角效果图.png`);
  }, "image/png");
  toast("四视角效果图已导出");
};

// 长度分区单:各区域平均毛长(毫米)
export const exportLengthSheet = async (app: App) => {
  const { avg, counts } = await app.hair.regionStats();
  const lines = [
    `宠物,${app.profile?.name ?? ""}`,
    `品种,${app.profile?.breed ?? ""}`,
    `日期,${new Date().toLocaleString("zh-CN")}`,
    "",
    "分区,平均毛长(mm),发丝数",
  ];
  REGIONS.forEach((name, i) => {
    if (counts[i] > 0) lines.push(`${name},${avg[i].toFixed(1)},${counts[i]}`);
  });
  const csv = "﻿" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  download(URL.createObjectURL(blob), `${app.profile?.name ?? "pet"}-长度分区单.csv`);
  toast("长度分区单已导出");
};
