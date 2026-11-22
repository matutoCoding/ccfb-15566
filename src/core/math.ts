// 最小数学库:vec3 / mat4,列主序,右手系
export type Vec3 = [number, number, number];
export type Mat4 = Float32Array<ArrayBuffer>;

export const v3 = (x = 0, y = 0, z = 0): Vec3 => [x, y, z];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
export const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

export const mat4Identity = (): Mat4 =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

export const mat4Mul = (a: Mat4, b: Mat4): Mat4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
};

export const mat4Perspective = (fovY: number, aspect: number, near: number, far: number): Mat4 => {
  const f = 1 / Math.tan(fovY / 2);
  const o = new Float32Array(16);
  o[0] = f / aspect;
  o[5] = f;
  o[10] = far / (near - far);
  o[11] = -1;
  o[14] = (far * near) / (near - far);
  return o;
};

export const mat4Ortho = (l: number, r: number, b: number, t: number, n: number, f: number): Mat4 => {
  const o = new Float32Array(16);
  o[0] = 2 / (r - l);
  o[5] = 2 / (t - b);
  o[10] = 1 / (n - f);
  o[12] = (l + r) / (l - r);
  o[13] = (b + t) / (b - t);
  o[14] = n / (n - f);
  o[15] = 1;
  return o;
};

export const mat4LookAt = (eye: Vec3, target: Vec3, up: Vec3): Mat4 => {
  const z = norm(sub(eye, target));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  const o = mat4Identity();
  o[0] = x[0]; o[4] = x[1]; o[8] = x[2];
  o[1] = y[0]; o[5] = y[1]; o[9] = y[2];
  o[2] = z[0]; o[6] = z[1]; o[10] = z[2];
  o[12] = -dot(x, eye); o[13] = -dot(y, eye); o[14] = -dot(z, eye);
  return o;
};

// 射线与球求交,返回最近 t,未命中返回 -1
export const raySphere = (ro: Vec3, rd: Vec3, c: Vec3, r: number): number => {
  const oc = sub(ro, c);
  const b = dot(oc, rd);
  const cc = dot(oc, oc) - r * r;
  const h = b * b - cc;
  if (h < 0) return -1;
  const t = -b - Math.sqrt(h);
  return t > 0 ? t : -1;
};

// 射线与胶囊(线段 ab 半径 r)求交,返回最近 t
export const rayCapsule = (ro: Vec3, rd: Vec3, a: Vec3, b: Vec3, r: number): number => {
  const ba = sub(b, a);
  const oa = sub(ro, a);
  const baba = dot(ba, ba);
  const bard = dot(ba, rd);
  const baoa = dot(ba, oa);
  const rdoa = dot(rd, oa);
  const oaoa = dot(oa, oa);
  const A = baba - bard * bard;
  let B = baba * rdoa - baoa * bard;
  let C = baba * oaoa - baoa * baoa - r * r * baba;
  let h = B * B - A * C;
  if (h >= 0) {
    const t = (-B - Math.sqrt(h)) / A;
    const y = baoa + t * bard;
    if (y > 0 && y < baba && t > 0) return t;
    const oc = y <= 0 ? oa : sub(ro, b);
    B = dot(rd, oc);
    C = dot(oc, oc) - r * r;
    h = B * B - C;
    if (h > 0) {
      const t2 = -B - Math.sqrt(h);
      if (t2 > 0) return t2;
    }
  }
  return -1;
};
