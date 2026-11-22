// 程序化宠物模型:由球/胶囊拼出身体,同时产出渲染网格、物理碰撞体、植发采样点
import { BodyParams, REGION_COUNT } from "./breeds";
import { Vec3, add, cross, dot, norm, rayCapsule, scale, sub } from "../core/math";

export interface Part {
  a: Vec3; // 胶囊起点(球心)
  b: Vec3; // 胶囊终点(球时等于 a)
  r: number;
  region: number; // 见 REGIONS
  hair: number; // 毛发密度 0-1,0 表示不长毛
  tint: Vec3; // 网格着色
}

export interface PetModel {
  parts: Part[];
  vertices: Float32Array<ArrayBuffer>; // pos3 normal3 region1 tint3 = 10 floats
  indices: Uint32Array<ArrayBuffer>;
  vertexCount: number;
  indexCount: number;
}

// 可复现随机数
export const mulberry32 = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// 由体型参数生成身体各部件
export const buildParts = (p: BodyParams): Part[] => {
  const parts: Part[] = [];
  const bodyY = p.legLen + p.girth * 0.72;
  const zF = p.bodyLen / 2; // 前
  const zB = -p.bodyLen / 2; // 后
  const headR = p.headScale * 6.5;
  const headC: Vec3 = [0, bodyY + p.girth * 0.45 + p.neckLen * 0.75, zF + p.neckLen * 0.55];
  const skin: Vec3 = [0.85, 0.7, 0.62];

  parts.push({ a: [0, bodyY, zB], b: [0, bodyY, zF - p.girth * 0.4], r: p.girth, region: 0, hair: 1, tint: skin });
  // 颈部
  parts.push({ a: [0, bodyY + p.girth * 0.3, zF - p.girth * 0.8], b: [headC[0], headC[1] - headR * 0.4, headC[2] - headR * 0.5], r: p.girth * 0.62, region: 10, hair: 1, tint: skin });
  // 头
  parts.push({ a: headC, b: headC, r: headR, region: 1, hair: 1, tint: skin });
  // 吻部
  const mzA: Vec3 = [0, headC[1] - headR * 0.25, headC[2] + headR * 0.55];
  const mzB: Vec3 = [0, headC[1] - headR * 0.35, headC[2] + headR * 0.55 + p.muzzleLen];
  parts.push({ a: mzA, b: mzB, r: headR * 0.42, region: 2, hair: 0.75, tint: skin });
  // 鼻子(不长毛)
  parts.push({ a: [mzB[0], mzB[1], mzB[2] + 0.4], b: [mzB[0], mzB[1], mzB[2] + 0.4], r: headR * 0.2, region: 2, hair: 0, tint: [0.12, 0.1, 0.1] });
  // 眼睛
  const eyeY = headC[1] + headR * 0.15;
  const eyeZ = headC[2] + headR * 0.78;
  parts.push({ a: [-headR * 0.38, eyeY, eyeZ], b: [-headR * 0.38, eyeY, eyeZ], r: headR * 0.13, region: 1, hair: 0, tint: [0.1, 0.08, 0.08] });
  parts.push({ a: [headR * 0.38, eyeY, eyeZ], b: [headR * 0.38, eyeY, eyeZ], r: headR * 0.13, region: 1, hair: 0, tint: [0.1, 0.08, 0.08] });
  // 耳朵:droop 决定下垂/竖立
  for (const side of [-1, 1]) {
    const earBase: Vec3 = [side * headR * 0.72, headC[1] + headR * 0.5, headC[2] - headR * 0.1];
    const droop = p.earDroop;
    const earTip: Vec3 = [
      earBase[0] + side * p.earLen * 0.35 * (1 - droop * 0.5),
      earBase[1] + p.earLen * (1 - droop) - p.earLen * droop * 0.9,
      earBase[2] - p.earLen * 0.15,
    ];
    parts.push({ a: earBase, b: earTip, r: headR * 0.34, region: side < 0 ? 3 : 4, hair: 1, tint: skin });
  }
  // 腿
  const lx = p.girth * 0.58;
  const legTop = p.legLen + p.legR * 0.5;
  const legZ = [zF - p.girth * 0.9, zB + p.girth * 0.9];
  const legRegions = [5, 7];
  for (let zi = 0; zi < 2; zi++)
    for (const side of [-1, 1]) {
      const region = legRegions[zi] + (side > 0 ? 1 : 0);
      parts.push({ a: [side * lx, legTop, legZ[zi]], b: [side * lx, 0.5, legZ[zi]], r: p.legR, region, hair: 0.9, tint: skin });
    }
  // 尾巴:向后上方翘起
  parts.push({
    a: [0, bodyY + p.girth * 0.55, zB + 1],
    b: [0, bodyY + p.girth * 0.55 + p.tailLen * 0.75, zB - p.tailLen * 0.55],
    r: 1.6, region: 9, hair: 0.9, tint: skin,
  });
  return parts;
};

const closestOnSegment = (p: Vec3, a: Vec3, b: Vec3): Vec3 => {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1)));
  return add(a, scale(ab, t));
};

// 生成渲染网格:顶点 pos3+normal3+region1+tint3
export const buildMesh = (parts: Part[]): PetModel => {
  const verts: number[] = [];
  const idx: number[] = [];
  const RADIAL = 20;
  const RINGS = 14;

  for (const part of parts) {
    const base = verts.length / 10;
    const axis = sub(part.b, part.a);
    const axisLen = Math.hypot(...axis);
    const dir: Vec3 = axisLen > 1e-4 ? norm(axis) : [0, 1, 0];
    const helper: Vec3 = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(dir, helper));
    const v = cross(dir, u);
    // 轮廓线:下半球 - 圆柱 - 上半球
    for (let i = 0; i <= RINGS; i++) {
      const t = i / RINGS; // 0..1 沿轴
      let ringC: Vec3;
      let ringR: number;
      let ny: number; // 法线沿轴分量
      if (axisLen < 1e-4) {
        // 球
        const phi = t * Math.PI - Math.PI / 2;
        ringR = part.r * Math.cos(phi);
        ringC = add(part.a, scale(dir, part.r * Math.sin(phi)));
        ny = Math.sin(phi);
      } else if (t < 0.25) {
        const phi = (t / 0.25) * (Math.PI / 2) - Math.PI / 2;
        ringR = part.r * Math.cos(phi);
        ringC = add(part.a, scale(dir, part.r * Math.sin(phi)));
        ny = Math.sin(phi);
      } else if (t > 0.75) {
        const phi = ((t - 0.75) / 0.25) * (Math.PI / 2);
        ringR = part.r * Math.cos(phi);
        ringC = add(part.b, scale(dir, part.r * Math.sin(phi)));
        ny = Math.sin(phi);
      } else {
        ringR = part.r;
        ringC = add(part.a, scale(dir, ((t - 0.25) / 0.5) * axisLen));
        ny = 0;
      }
      for (let j = 0; j <= RADIAL; j++) {
        const th = (j / RADIAL) * Math.PI * 2;
        const nx = Math.cos(th);
        const nz = Math.sin(th);
        const n: Vec3 = norm([
          u[0] * nx + v[0] * nz + dir[0] * ny,
          u[1] * nx + v[1] * nz + dir[1] * ny,
          u[2] * nx + v[2] * nz + dir[2] * ny,
        ]);
        const p: Vec3 = [ringC[0] + u[0] * nx * ringR + v[0] * nz * ringR, ringC[1] + u[1] * nx * ringR + v[1] * nz * ringR, ringC[2] + u[2] * nx * ringR + v[2] * nz * ringR];
        verts.push(p[0], p[1], p[2], n[0], n[1], n[2], part.region, part.tint[0], part.tint[1], part.tint[2]);
      }
    }
    for (let i = 0; i < RINGS; i++)
      for (let j = 0; j < RADIAL; j++) {
        const a0 = base + i * (RADIAL + 1) + j;
        const b0 = a0 + RADIAL + 1;
        idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
      }
  }
  return {
    parts,
    vertices: new Float32Array(verts),
    indices: new Uint32Array(idx),
    vertexCount: verts.length / 10,
    indexCount: idx.length,
  };
};

export interface HairRoot {
  pos: Vec3;
  normal: Vec3;
  region: number;
}

// 按表面积加权在各部件表面采样发根,落在其它部件内部的点重采样
export const sampleHairRoots = (parts: Part[], count: number, seed: number): HairRoot[] => {
  const rand = mulberry32(seed);
  const hairParts = parts.filter((p) => p.hair > 0);
  const area = (p: Part) => {
    const l = Math.hypot(...sub(p.b, p.a));
    return (2 * Math.PI * p.r * l + 4 * Math.PI * p.r * p.r) * p.hair;
  };
  const areas = hairParts.map(area);
  const total = areas.reduce((s, x) => s + x, 0);
  const roots: HairRoot[] = [];

  const insideOther = (pt: Vec3, self: Part): boolean => {
    for (const q of parts) {
      if (q === self) continue;
      const c = closestOnSegment(pt, q.a, q.b);
      const d = Math.hypot(...sub(pt, c));
      if (d < q.r * 0.85) return true;
    }
    return false;
  };

  for (let pi = 0; pi < hairParts.length; pi++) {
    const part = hairParts[pi];
    const n = Math.round((areas[pi] / total) * count);
    const axis = sub(part.b, part.a);
    const axisLen = Math.hypot(...axis);
    const dir: Vec3 = axisLen > 1e-4 ? norm(axis) : [0, 1, 0];
    const helper: Vec3 = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(dir, helper));
    const v = cross(dir, u);
    for (let k = 0; k < n; k++) {
      let placed = false;
      for (let attempt = 0; attempt < 4 && !placed; attempt++) {
        const th = rand() * Math.PI * 2;
        // 沿轴均匀取点(含两端半球帽近似)
        const t = rand();
        const c: Vec3 = [
          part.a[0] + axis[0] * t,
          part.a[1] + axis[1] * t,
          part.a[2] + axis[2] * t,
        ];
        const nrm: Vec3 = norm([
          u[0] * Math.cos(th) + v[0] * Math.sin(th),
          u[1] * Math.cos(th) + v[1] * Math.sin(th),
          u[2] * Math.cos(th) + v[2] * Math.sin(th),
        ]);
        const pt = add(c, scale(nrm, part.r));
        if (insideOther(pt, part)) continue;
        roots.push({ pos: pt, normal: nrm, region: part.region });
        placed = true;
      }
    }
  }
  // 补足因重采样丢弃的数量
  while (roots.length < count) {
    const part = hairParts[Math.floor(rand() * hairParts.length)];
    const th = rand() * Math.PI * 2;
    const axis = sub(part.b, part.a);
    const dir: Vec3 = norm([axis[0] || 0.01, axis[1], axis[2]]);
    const helper: Vec3 = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = norm(cross(dir, helper));
    const v = cross(dir, u);
    const t = rand();
    const c = add(part.a, scale(axis, t));
    const nrm: Vec3 = norm([
      u[0] * Math.cos(th) + v[0] * Math.sin(th),
      u[1] * Math.cos(th) + v[1] * Math.sin(th),
      u[2] * Math.cos(th) + v[2] * Math.sin(th),
    ]);
    roots.push({ pos: add(c, scale(nrm, part.r)), normal: nrm, region: part.region });
  }
  return roots;
};

export interface RayHit {
  t: number;
  point: Vec3;
  normal: Vec3;
  region: number;
}

// 解析式射线拾取:与所有部件胶囊求交取最近
export const raycastParts = (parts: Part[], ro: Vec3, rd: Vec3): RayHit | null => {
  let best: RayHit | null = null;
  for (const p of parts) {
    const t = rayCapsule(ro, rd, p.a, p.b, p.r);
    if (t > 0 && (!best || t < best.t)) {
      const point = add(ro, scale(rd, t));
      const c = closestOnSegment(point, p.a, p.b);
      best = { t, point, normal: norm(sub(point, c)), region: p.region };
    }
  }
  return best;
};

export const regionName = (r: number): string =>
  r >= 0 && r < REGION_COUNT
    ? ["躯干", "头部", "吻部", "左耳", "右耳", "左前腿", "右前腿", "左后腿", "右后腿", "尾巴", "颈部"][r]
    : "未知";
