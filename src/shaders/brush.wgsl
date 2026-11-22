// 造型笔刷:剪刀/推子/梳子/染色,只改刷到的发丝
struct Strand { rootPos: vec4f, normal: vec4f }
struct Style {
  params: vec4f,
  dir: vec4f,
  colorRoot: vec4f,
  colorTip: vec4f,
}
// tool: 0剪刀 1推子 2梳子 3染色
// value: 剪刀=单次剪掉长度cm / 推子=刀头目标长度cm
// strength: 0-1, regionMask: -1全部 否则只作用该分区
struct Brush {
  pos: vec4f,      // xyz + radius
  param: vec4f,    // tool, value, strength, regionMask
  dir: vec4f,      // 梳理方向 xyz
  color0: vec4f,   // 毛根色
  color1: vec4f,   // 毛尖色
  count: u32, pad0: u32, pad1: u32, pad2: u32,
}

@group(0) @binding(0) var<uniform> brush: Brush;
@group(0) @binding(1) var<storage, read> strands: array<Strand>;
@group(0) @binding(2) var<storage, read_write> styles: array<Style>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= brush.count) { return; }
  let st = strands[idx];
  var sy = styles[idx];

  let region = i32(st.rootPos.w + 0.5);
  let mask = i32(brush.param.w + 0.5);
  if (mask >= 0 && region != mask) { return; }

  let d = distance(st.rootPos.xyz, brush.pos.xyz);
  let radius = max(brush.pos.w, 1e-3);
  if (d > radius) { return; }
  // 核心区(falloff>0.6)精确作用,边缘平滑过渡
  let falloff = smoothstep(radius, radius * 0.4, d) * brush.param.z;
  if (falloff <= 0.0) { return; }

  let tool = i32(brush.param.x + 0.5);
  let value = brush.param.y;

  if (tool == 0) {
    // 剪刀:按量剪短
    sy.params.x = max(0.15, sy.params.x - value * falloff);
  } else if (tool == 1) {
    // 推子:核心区域直接设为目标长度,保证毫米级精度
    if (falloff > 0.6) {
      sy.params.x = value;
    } else {
      sy.params.x = mix(sy.params.x, value, falloff);
    }
  } else if (tool == 2) {
    // 梳子:方向梳向拖拽方向
    let bd = normalize(brush.dir.xyz);
    let cur = normalize(sy.dir.xyz);
    sy.dir = vec4f(normalize(mix(cur, bd, falloff)), min(1.0, sy.dir.w + falloff));
  } else if (tool == 3) {
    // 染色:毛根毛尖分别渐变混合
    sy.colorRoot = vec4f(mix(sy.colorRoot.rgb, brush.color0.rgb, falloff), 1.0);
    sy.colorTip = vec4f(mix(sy.colorTip.rgb, brush.color1.rgb, falloff), 1.0);
  }
  styles[idx] = sy;
}
