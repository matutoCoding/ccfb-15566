// 档案与设置持久化:localStorage + 文件导入导出
import { BodyParams, BreedId, BREEDS } from "../pet/breeds";

export interface HairScale {
  length: number;
  thickness: number;
  curl: number;
  stiffness: number;
}

export interface GroomStroke {
  p: [number, number, number]; // 笔刷位置
  g: [number, number, number]; // 梳理方向
  t: number; // 工具 0剪刀 1推子 2梳子 3染色
  r: number; // 半径
  v: number; // 参数(剪掉量/刀头长度)
  s: number; // 强度
  m: number; // 分区遮罩 -1全部
  c0: number[]; // 毛根色
  c1: number[]; // 毛尖色
}

export interface Profile {
  id: string;
  name: string;
  breed: BreedId;
  body: BodyParams;
  hairScale: HairScale;
  templateId: string;
  rootColor: number[];
  tipColor: number[];
  strokes: GroomStroke[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  strandCount: number;
  iterations: number;
  gravity: number;
  hairWidth: number;
  aoStrength: number;
  lightIntensity: number;
  ambient: number;
  showFps: boolean;
  bg: string;
  lightYaw: number;
  lightPitch: number;
}

const PKEY = "pet-groom:profiles";
const SKEY = "pet-groom:settings";

export const defaultSettings = (): Settings => ({
  strandCount: 300000,
  iterations: 2,
  gravity: 260,
  hairWidth: 1.0,
  aoStrength: 0.55,
  lightIntensity: 1.1,
  ambient: 0.35,
  showFps: true,
  bg: "#1c1e24",
  lightYaw: 0.7,
  lightPitch: 0.9,
});

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SKEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch { /* 忽略损坏数据 */ }
  return defaultSettings();
};

export const saveSettings = (s: Settings) => localStorage.setItem(SKEY, JSON.stringify(s));

export const loadProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem(PKEY);
    if (raw) return JSON.parse(raw);
  } catch { /* 忽略损坏数据 */ }
  return [];
};

export const saveProfiles = (list: Profile[]) => localStorage.setItem(PKEY, JSON.stringify(list));

export const createProfile = (breed: BreedId, name: string): Profile => {
  const b = BREEDS[breed];
  const now = new Date().toISOString();
  return {
    id: `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`,
    name,
    breed,
    body: { ...b.body },
    hairScale: { length: 1, thickness: 1, curl: 1, stiffness: 1 },
    templateId: "natural",
    rootColor: [...b.color],
    tipColor: [...b.color],
    strokes: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const exportProfileFile = (p: Profile) => {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${p.name || "宠物档案"}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const importProfileFile = async (file: File): Promise<Profile> => {
  const p = JSON.parse(await file.text()) as Profile;
  if (!p.id || !p.breed || !BREEDS[p.breed]) throw new Error("档案格式不正确");
  p.id = `p${Date.now().toString(36)}`; // 避免与现有档案冲突
  return p;
};
