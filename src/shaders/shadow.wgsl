// 阴影贴图:从光源方向渲染身体深度
struct Light { viewProj: mat4x4f }
@group(0) @binding(0) var<uniform> light: Light;

@vertex
fn vs(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return light.viewProj * vec4f(pos, 1.0);
}
