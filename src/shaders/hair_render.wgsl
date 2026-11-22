// 发丝渲染:公告板条带 + Kajiya-Kay 各向异性高光 + 深度 AO 自阴影
struct Strand { rootPos: vec4f, normal: vec4f }
struct Style {
  params: vec4f,
  dir: vec4f,
  colorRoot: vec4f,
  colorTip: vec4f,
}
struct Pos { p: array<vec4f, 4>, prev: array<vec4f, 4> }
struct Frame {
  viewProj: mat4x4f,
  lightViewProj: mat4x4f,
  cameraPos: vec4f,
  lightDir: vec4f,  // xyz方向 w强度
  ambient: vec4f,   // rgb环境光 w AO强度
  misc: vec4f,      // x时间 y发丝宽度倍率 z阴影偏移 w发丝总数
}

@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var shadowTex: texture_depth_2d;
@group(0) @binding(2) var shadowSampler: sampler_comparison;
@group(1) @binding(0) var<storage, read> strands: array<Strand>;
@group(1) @binding(1) var<storage, read> styles: array<Style>;
@group(1) @binding(2) var<storage, read> pos: array<Pos>;

struct VsOut {
  @builtin(position) clip: vec4f,
  @location(0) tangent: vec3f,
  @location(1) color: vec3f,
  @location(2) t: f32,        // 沿发丝 0根 1尖
  @location(3) worldPos: vec3f,
  @location(4) @interpolate(flat) strandId: u32,
}

@vertex
fn vs(@builtin(vertex_index) vi: u32) -> VsOut {
  let strandIdx = vi / 18u;
  let rem = vi % 18u;
  let seg = rem / 6u;
  let corner = rem % 6u;
  // 每个四边形两个三角形:0,1,2 / 1,3,2
  var side = -1.0;
  if (corner == 1u || corner == 3u || corner == 4u) { side = 1.0; }
  var ty = 0.0;
  if (corner >= 2u) { ty = 1.0; }

  let st = strands[strandIdx];
  let sy = styles[strandIdx];
  let p = pos[strandIdx];

  let p0 = p.p[seg].xyz;
  let p1 = p.p[seg + 1u].xyz;
  let center = mix(p0, p1, ty);
  let t = (f32(seg) + ty) / 3.0;
  let tangent = normalize(p1 - p0 + vec3f(1e-6));
  let toCam = normalize(frame.cameraPos.xyz - center);
  let sideDir = normalize(cross(tangent, toCam));
  // 根部粗梢部细
  let width = st.normal.w * frame.misc.y * (1.0 - 0.65 * t);
  let world = center + sideDir * side * width * 0.5;

  var out: VsOut;
  out.clip = frame.viewProj * vec4f(world, 1.0);
  out.tangent = tangent;
  out.color = mix(sy.colorRoot.rgb, sy.colorTip.rgb, t);
  out.t = t;
  out.worldPos = world;
  out.strandId = strandIdx;
  return out;
}

fn shadowFactor(worldPos: vec3f) -> f32 {
  let lp = frame.lightViewProj * vec4f(worldPos, 1.0);
  let ndc = lp.xyz / lp.w;
  let uv = vec2f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0 || ndc.z > 1.0) {
    return 1.0;
  }
  return textureSampleCompare(shadowTex, shadowSampler, uv, ndc.z - frame.misc.z);
}

@fragment
fn fs(in: VsOut) -> @location(0) vec4f {
  let T = normalize(in.tangent);
  let V = normalize(frame.cameraPos.xyz - in.worldPos);
  let L = normalize(-frame.lightDir.xyz);
  let N = normalize(cross(T, cross(V, T))); // 发丝法线近似

  // 漫反射:Kajiya-Kay sin(T,L)
  let sinTL = sqrt(max(0.0, 1.0 - dot(T, L) * dot(T, L)));
  let diff = mix(0.35, 1.0, sinTL);

  // 各向异性双高光:主高光向梢偏移,次高光更宽带彩色
  let shift = 0.15;
  let T1 = normalize(T + N * shift);
  let T2 = normalize(T + N * shift * 2.5);
  let H = normalize(L + V);
  let sinTH1 = sqrt(max(0.0, 1.0 - dot(T1, H) * dot(T1, H)));
  let sinTH2 = sqrt(max(0.0, 1.0 - dot(T2, H) * dot(T2, H)));
  let spec1 = pow(sinTH1, 64.0) * 0.6;
  let spec2 = pow(sinTH2, 24.0) * 0.25;

  // 自阴影近似:发根处相互遮蔽变暗 + 逐缕抖动模拟层间阴影
  let jitter = fract(sin(f32(in.strandId) * 12.9898) * 43758.5453);
  let ao = mix(1.0 - frame.ambient.w, 1.0, pow(in.t, 0.7)) * (0.85 + 0.15 * jitter);
  let shadow = shadowFactor(in.worldPos);

  let light = frame.ambient.rgb + frame.lightDir.w * shadow * vec3f(1.0, 0.98, 0.95);
  var col = in.color * diff * ao * light;
  col += (spec1 * vec3f(1.0) + spec2 * in.color) * shadow * frame.lightDir.w * ao;
  return vec4f(col, 1.0);
}
