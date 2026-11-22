// 体型参数与品种预设,单位:厘米
export interface BodyParams {
  bodyLen: number; // 躯干长
  girth: number; // 躯干围度(半径)
  legLen: number; // 腿部长度
  legR: number; // 腿部粗细
  headScale: number; // 头部大小
  neckLen: number; // 颈长
  muzzleLen: number; // 吻部长度
  earLen: number; // 耳长
  earDroop: number; // 耳下垂度 0立耳 1垂耳
  tailLen: number; // 尾长
}

export type BreedId = "teddy" | "bichon" | "schnauzer";

export interface Breed {
  id: BreedId;
  name: string;
  body: BodyParams;
  // 毛发特征预设
  hair: { length: number; thickness: number; curl: number; stiffness: number };
  color: [number, number, number];
}

export const BREEDS: Record<BreedId, Breed> = {
  teddy: {
    id: "teddy",
    name: "泰迪",
    body: { bodyLen: 26, girth: 8.5, legLen: 14, legR: 2.2, headScale: 1.0, neckLen: 5, muzzleLen: 4.5, earLen: 7, earDroop: 0.9, tailLen: 6 },
    hair: { length: 3.5, thickness: 0.045, curl: 0.85, stiffness: 0.35 },
    color: [0.62, 0.38, 0.2],
  },
  bichon: {
    id: "bichon",
    name: "比熊",
    body: { bodyLen: 27, girth: 9.5, legLen: 13, legR: 2.4, headScale: 1.1, neckLen: 5.5, muzzleLen: 4, earLen: 6.5, earDroop: 1.0, tailLen: 8 },
    hair: { length: 4.5, thickness: 0.05, curl: 0.6, stiffness: 0.3 },
    color: [0.95, 0.93, 0.9],
  },
  schnauzer: {
    id: "schnauzer",
    name: "雪纳瑞",
    body: { bodyLen: 30, girth: 9, legLen: 17, legR: 2.3, headScale: 1.0, neckLen: 6.5, muzzleLen: 6.5, earLen: 5.5, earDroop: 0.55, tailLen: 5 },
    hair: { length: 2.5, thickness: 0.06, curl: 0.12, stiffness: 0.85 },
    color: [0.45, 0.46, 0.48],
  },
};

// 毛发分区
export const REGIONS = [
  "躯干", "头部", "吻部", "左耳", "右耳",
  "左前腿", "右前腿", "左后腿", "右后腿", "尾巴", "颈部",
] as const;
export const REGION_COUNT = REGIONS.length;
