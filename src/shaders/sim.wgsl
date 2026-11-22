// 毛发物理模拟:Verlet 积分 + 距离约束 + 形状记忆 + 胶囊碰撞
struct Strand {
  rootPos: vec4f, // xyz + region
  normal: vec4f,  // xyz + thickness
}
struct Style {
  params: vec4f,    // length, curl, stiffness, mess
  dir: vec4f,       // 梳理方向 xyz + 权重 w
  colorRoot: vec4f,
  colorTip: vec4f,
}
struct Pos { p: array<vec4f, 4>, prev: array<vec4f, 4> }
struct Collider { a: vec4f, b: vec4f, r: f32, pad0: f32, pad1: f32, pad2: f32 }
struct SimParams {
  dt: f32, gravity: f32, damping: f32, iterations: f32,
  strandCount: u32, colliderCount: u32, time: f32, pad: f32,
}

@group(0) @binding(0) var<uniform> sim: SimParams;
@group(0) @binding(1) var<storage, read> colliders: array<Collider>;
@group(0) @binding(2) var<storage, read> strands: array<Strand>;
@group(0) @binding(3) var<storage, read> styles: array<Style>;
@group(0) @binding(4) var<storage, read_write> pos: array<Pos>;

fn hash1(n: f32) -> f32 {
  return fract(sin(n * 127.1) * 43758.5453);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= sim.strandCount) { return; }
  let st = strands[idx];
  let sy = styles[idx];
  var p = pos[idx];

  let length = max(sy.params.x, 0.05);
  let curl = sy.params.y;
  let stiff = sy.params.z;
  let segLen = length / 3.0;
  let root = st.rootPos.xyz;
  // 静止方向:法线与梳理方向按权重混合
  var restDir = normalize(mix(normalize(st.normal.xyz), normalize(sy.dir.xyz), clamp(sy.dir.w, 0.0, 1.0)));
  // 卷曲的垂直基
  var helper = vec3f(0.0, 1.0, 0.0);
  if (abs(restDir.y) > 0.9) { helper = vec3f(1.0, 0.0, 0.0); }
  let cu = normalize(cross(restDir, helper));
  let cv = cross(restDir, cu);
  let phase = hash1(f32(idx)) * 6.2831;
  let curlAmp = curl * segLen * 0.55;
  let curlFreq = 2.0 + curl * 5.0;

  // Verlet 积分(发根固定)
  p.p[0] = vec4f(root, 1.0);
  let g = vec3f(0.0, -sim.gravity, 0.0) * sim.dt * sim.dt;
  for (var i = 1; i < 4; i++) {
    let cur = p.p[i].xyz;
    let vel = (cur - p.prev[i].xyz) * sim.damping;
    p.prev[i] = vec4f(cur, 1.0);
    p.p[i] = vec4f(cur + vel + g, 1.0);
  }

  let iters = max(1, i32(sim.iterations));
  for (var it = 0; it < iters; it++) {
    // 距离约束(从根向梢传递)
    p.p[0] = vec4f(root, 1.0);
    for (var i = 1; i < 4; i++) {
      let d = p.p[i].xyz - p.p[i - 1].xyz;
      let l = max(length(d), 1e-5);
      p.p[i] = vec4f(p.p[i - 1].xyz + d / l * segLen, 1.0);
    }
    // 形状记忆:拉向带卷曲的静止形态
    for (var i = 1; i < 4; i++) {
      let fi = f32(i);
      let ang = phase + fi * curlFreq;
      let rest = root + restDir * segLen * fi
        + (cu * cos(ang) + cv * sin(ang)) * curlAmp * fi / 3.0;
      p.p[i] = vec4f(mix(p.p[i].xyz, rest, stiff * 0.45), 1.0);
    }
    // 胶囊碰撞:不能穿进身体
    for (var c = 0u; c < sim.colliderCount; c++) {
      let col = colliders[c];
      let ab = col.b.xyz - col.a.xyz;
      for (var i = 1; i < 4; i++) {
        let pi = p.p[i].xyz;
        let t = clamp(dot(pi - col.a.xyz, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
        let closest = col.a.xyz + ab * t;
        let off = pi - closest;
        let d = length(off);
        let minD = col.r + 0.03;
        if (d < minD) {
          p.p[i] = vec4f(closest + off / max(d, 1e-5) * minD, 1.0);
        }
      }
    }
  }
  pos[idx] = p;
}
