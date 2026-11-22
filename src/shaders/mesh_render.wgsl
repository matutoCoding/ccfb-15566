// 身体网格渲染:Lambert + 阴影贴图
struct Frame {
  viewProj: mat4x4f,
  lightViewProj: mat4x4f,
  cameraPos: vec4f,
  lightDir: vec4f,
  ambient: vec4f,
  misc: vec4f,
}

@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var shadowTex: texture_depth_2d;
@group(0) @binding(2) var shadowSampler: sampler_comparison;

struct VsOut {
  @builtin(position) clip: vec4f,
  @location(0) normal: vec3f,
  @location(1) tint: vec3f,
  @location(2) worldPos: vec3f,
}

@vertex
fn vs(
  @location(0) pos: vec3f,
  @location(1) normal: vec3f,
  @location(2) region: f32,
  @location(3) tint: vec3f,
) -> VsOut {
  var out: VsOut;
  out.clip = frame.viewProj * vec4f(pos, 1.0);
  out.normal = normal;
  out.tint = tint;
  out.worldPos = pos;
  return out;
}

@fragment
fn fs(in: VsOut) -> @location(0) vec4f {
  let N = normalize(in.normal);
  let L = normalize(-frame.lightDir.xyz);
  let lp = frame.lightViewProj * vec4f(in.worldPos, 1.0);
  let ndc = lp.xyz / lp.w;
  let uv = vec2f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5);
  var shadow = 1.0;
  if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0 && ndc.z <= 1.0) {
    shadow = textureSampleCompare(shadowTex, shadowSampler, uv, ndc.z - frame.misc.z);
  }
  let diff = max(dot(N, L), 0.0) * frame.lightDir.w * shadow;
  let col = in.tint * (frame.ambient.rgb + diff * vec3f(1.0, 0.98, 0.95));
  return vec4f(col, 1.0);
}
