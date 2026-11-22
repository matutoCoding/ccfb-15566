// 模板套用:按分区设置目标长度/卷曲,带混合过渡
struct Strand { rootPos: vec4f, normal: vec4f }
struct Style {
  params: vec4f,
  dir: vec4f,
  colorRoot: vec4f,
  colorTip: vec4f,
}
struct Template {
  regions: array<vec4f, 16>, // x目标长度 y卷曲倍率 z混合度 w刚度倍率
  count: u32, pad0: u32, pad1: u32, pad2: u32,
}

@group(0) @binding(0) var<uniform> tmpl: Template;
@group(0) @binding(1) var<storage, read> strands: array<Strand>;
@group(0) @binding(2) var<storage, read_write> styles: array<Style>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= tmpl.count) { return; }
  let st = strands[idx];
  var sy = styles[idx];
  let region = u32(st.rootPos.w + 0.5);
  let rp = tmpl.regions[region];
  let blend = clamp(rp.z, 0.0, 1.0);
  sy.params.x = mix(sy.params.x, rp.x, blend);
  sy.params.y = clamp(sy.params.y * mix(1.0, rp.y, blend), 0.0, 1.0);
  sy.params.z = clamp(sy.params.z * mix(1.0, rp.w, blend), 0.0, 1.0);
  // 套用模板时方向权重衰减,让毛发回到自然垂落再微调
  sy.dir.w = sy.dir.w * (1.0 - blend * 0.7);
  styles[idx] = sy;
}
