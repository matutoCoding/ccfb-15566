// 分区长度统计:为美容师长度分区单汇总各区域平均毛长
struct Strand { rootPos: vec4f, normal: vec4f }
struct Style {
  params: vec4f,
  dir: vec4f,
  colorRoot: vec4f,
  colorTip: vec4f,
}
struct Stats { sums: array<atomic<u32>, 16>, counts: array<atomic<u32>, 16> }
struct Count { n: u32, pad0: u32, pad1: u32, pad2: u32 }

@group(0) @binding(0) var<uniform> cnt: Count;
@group(0) @binding(1) var<storage, read> strands: array<Strand>;
@group(0) @binding(2) var<storage, read> styles: array<Style>;
@group(0) @binding(3) var<storage, read_write> stats: Stats;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let idx = gid.x;
  if (idx >= cnt.n) { return; }
  let region = u32(strands[idx].rootPos.w + 0.5);
  if (region >= 16u) { return; }
  // 长度以 0.01mm 为单位累加,读回后换算
  atomicAdd(&stats.sums[region], u32(styles[idx].params.x * 1000.0));
  atomicAdd(&stats.counts[region], 1u);
}
