(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();const oe=async o=>{if(!navigator.gpu)throw new Error("当前浏览器不支持 WebGPU,请使用 Chrome 113+ / Edge 113+");const e=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!e)throw new Error("未找到可用的 GPU 适配器");const t=await e.requestDevice(),i=o.getContext("webgpu"),a=navigator.gpu.getPreferredCanvasFormat();i.configure({device:t,format:a,alphaMode:"opaque"});let r=null,s=0,n=0;const c=()=>{const d=Math.min(window.devicePixelRatio,2),h=Math.max(1,Math.floor(o.clientWidth*d)),u=Math.max(1,Math.floor(o.clientHeight*d));h===s&&u===n&&r||(s=h,n=u,o.width=h,o.height=u,r?.destroy(),r=t.createTexture({size:[h,u],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}))};return c(),{device:t,context:i,canvas:o,format:a,get depthView(){return r.createView()},get width(){return s},get height(){return n},resize:c}},E=(o,e)=>[o[0]+e[0],o[1]+e[1],o[2]+e[2]],T=(o,e)=>[o[0]-e[0],o[1]-e[1],o[2]-e[2]],U=(o,e)=>[o[0]*e,o[1]*e,o[2]*e],N=(o,e)=>o[0]*e[0]+o[1]*e[1]+o[2]*e[2],A=(o,e)=>[o[1]*e[2]-o[2]*e[1],o[2]*e[0]-o[0]*e[2],o[0]*e[1]-o[1]*e[0]],ae=o=>Math.hypot(o[0],o[1],o[2]),M=o=>{const e=ae(o)||1;return[o[0]/e,o[1]/e,o[2]/e]},ce=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),W=(o,e)=>{const t=new Float32Array(16);for(let i=0;i<4;i++)for(let a=0;a<4;a++){let r=0;for(let s=0;s<4;s++)r+=o[s*4+a]*e[i*4+s];t[i*4+a]=r}return t},le=(o,e,t,i)=>{const a=1/Math.tan(o/2),r=new Float32Array(16);return r[0]=a/e,r[5]=a,r[10]=i/(t-i),r[11]=-1,r[14]=i*t/(t-i),r},de=(o,e,t,i,a,r)=>{const s=new Float32Array(16);return s[0]=2/(e-o),s[5]=2/(i-t),s[10]=1/(a-r),s[12]=(o+e)/(o-e),s[13]=(t+i)/(t-i),s[14]=a/(a-r),s[15]=1,s},ee=(o,e,t)=>{const i=M(T(o,e)),a=M(A(t,i)),r=A(i,a),s=ce();return s[0]=a[0],s[4]=a[1],s[8]=a[2],s[1]=r[0],s[5]=r[1],s[9]=r[2],s[2]=i[0],s[6]=i[1],s[10]=i[2],s[12]=-N(a,o),s[13]=-N(r,o),s[14]=-N(i,o),s},he=(o,e,t,i,a)=>{const r=T(i,t),s=T(o,t),n=N(r,r),c=N(r,e),d=N(r,s),h=N(e,s),u=N(s,s),p=n-c*c;let f=n*h-d*c,v=n*u-d*d-a*a*n,m=f*f-p*v;if(m>=0){const y=(-f-Math.sqrt(m))/p,b=d+y*c;if(b>0&&b<n&&y>0)return y;const g=b<=0?s:T(o,i);if(f=N(e,g),v=N(g,g)-a*a,m=f*f-v,m>0){const P=-f-Math.sqrt(m);if(P>0)return P}}return-1};class ue{yaw=.6;pitch=.25;dist=90;target=[0,14,0];fov=Math.PI/4;view(){return ee(this.eye(),this.target,[0,1,0])}proj(e){return le(this.fov,e,.5,800)}eye(){const e=Math.cos(this.pitch);return[this.target[0]+this.dist*e*Math.sin(this.yaw),this.target[1]+this.dist*Math.sin(this.pitch),this.target[2]+this.dist*e*Math.cos(this.yaw)]}right(){return[Math.cos(this.yaw),0,-Math.sin(this.yaw)]}ray(e,t,i){const a=this.eye(),r=Math.tan(this.fov/2),s=[this.target[0]-a[0],this.target[1]-a[1],this.target[2]-a[2]],n=Math.hypot(...s),c=[s[0]/n,s[1]/n,s[2]/n],d=this.right(),h=[d[1]*c[2]-d[2]*c[1],d[2]*c[0]-d[0]*c[2],d[0]*c[1]-d[1]*c[0]],u=e*r*i,p=t*r,f=[c[0]+d[0]*u+h[0]*p,c[1]+d[1]*u+h[1]*p,c[2]+d[2]*u+h[2]*p],v=Math.hypot(...f);return{ro:a,rd:[f[0]/v,f[1]/v,f[2]/v]}}}const I={teddy:{id:"teddy",name:"泰迪",body:{bodyLen:26,girth:8.5,legLen:14,legR:2.2,headScale:1,neckLen:5,muzzleLen:4.5,earLen:7,earDroop:.9,tailLen:6},hair:{length:3.5,thickness:.045,curl:.85,stiffness:.35},color:[.62,.38,.2]},bichon:{id:"bichon",name:"比熊",body:{bodyLen:27,girth:9.5,legLen:13,legR:2.4,headScale:1.1,neckLen:5.5,muzzleLen:4,earLen:6.5,earDroop:1,tailLen:8},hair:{length:4.5,thickness:.05,curl:.6,stiffness:.3},color:[.95,.93,.9]},schnauzer:{id:"schnauzer",name:"雪纳瑞",body:{bodyLen:30,girth:9,legLen:17,legR:2.3,headScale:1,neckLen:6.5,muzzleLen:6.5,earLen:5.5,earDroop:.55,tailLen:5},hair:{length:2.5,thickness:.06,curl:.12,stiffness:.85},color:[.45,.46,.48]}},$=["躯干","头部","吻部","左耳","右耳","左前腿","右前腿","左后腿","右后腿","尾巴","颈部"],fe=o=>{let e=o>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}},pe=o=>{const e=[],t=o.legLen+o.girth*.72,i=o.bodyLen/2,a=-o.bodyLen/2,r=o.headScale*6.5,s=[0,t+o.girth*.45+o.neckLen*.75,i+o.neckLen*.55],n=[.85,.7,.62];e.push({a:[0,t,a],b:[0,t,i-o.girth*.4],r:o.girth,region:0,hair:1,tint:n}),e.push({a:[0,t+o.girth*.3,i-o.girth*.8],b:[s[0],s[1]-r*.4,s[2]-r*.5],r:o.girth*.62,region:10,hair:1,tint:n}),e.push({a:s,b:s,r,region:1,hair:1,tint:n});const c=[0,s[1]-r*.25,s[2]+r*.55],d=[0,s[1]-r*.35,s[2]+r*.55+o.muzzleLen];e.push({a:c,b:d,r:r*.42,region:2,hair:.75,tint:n}),e.push({a:[d[0],d[1],d[2]+.4],b:[d[0],d[1],d[2]+.4],r:r*.2,region:2,hair:0,tint:[.12,.1,.1]});const h=s[1]+r*.15,u=s[2]+r*.78;e.push({a:[-r*.38,h,u],b:[-r*.38,h,u],r:r*.13,region:1,hair:0,tint:[.1,.08,.08]}),e.push({a:[r*.38,h,u],b:[r*.38,h,u],r:r*.13,region:1,hair:0,tint:[.1,.08,.08]});for(const y of[-1,1]){const b=[y*r*.72,s[1]+r*.5,s[2]-r*.1],g=o.earDroop,P=[b[0]+y*o.earLen*.35*(1-g*.5),b[1]+o.earLen*(1-g)-o.earLen*g*.9,b[2]-o.earLen*.15];e.push({a:b,b:P,r:r*.34,region:y<0?3:4,hair:1,tint:n})}const p=o.girth*.58,f=o.legLen+o.legR*.5,v=[i-o.girth*.9,a+o.girth*.9],m=[5,7];for(let y=0;y<2;y++)for(const b of[-1,1]){const g=m[y]+(b>0?1:0);e.push({a:[b*p,f,v[y]],b:[b*p,.5,v[y]],r:o.legR,region:g,hair:.9,tint:n})}return e.push({a:[0,t+o.girth*.55,a+1],b:[0,t+o.girth*.55+o.tailLen*.75,a-o.tailLen*.55],r:1.6,region:9,hair:.9,tint:n}),e},te=(o,e,t)=>{const i=T(t,e),a=Math.max(0,Math.min(1,N(T(o,e),i)/(N(i,i)||1)));return E(e,U(i,a))},me=o=>{const e=[],t=[];for(const r of o){const s=e.length/10,n=T(r.b,r.a),c=Math.hypot(...n),d=c>1e-4?M(n):[0,1,0],h=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],u=M(A(d,h)),p=A(d,u);for(let f=0;f<=14;f++){const v=f/14;let m,y,b;if(c<1e-4){const g=v*Math.PI-Math.PI/2;y=r.r*Math.cos(g),m=E(r.a,U(d,r.r*Math.sin(g))),b=Math.sin(g)}else if(v<.25){const g=v/.25*(Math.PI/2)-Math.PI/2;y=r.r*Math.cos(g),m=E(r.a,U(d,r.r*Math.sin(g))),b=Math.sin(g)}else if(v>.75){const g=(v-.75)/.25*(Math.PI/2);y=r.r*Math.cos(g),m=E(r.b,U(d,r.r*Math.sin(g))),b=Math.sin(g)}else y=r.r,m=E(r.a,U(d,(v-.25)/.5*c)),b=0;for(let g=0;g<=20;g++){const P=g/20*Math.PI*2,w=Math.cos(P),C=Math.sin(P),L=M([u[0]*w+p[0]*C+d[0]*b,u[1]*w+p[1]*C+d[1]*b,u[2]*w+p[2]*C+d[2]*b]),R=[m[0]+u[0]*w*y+p[0]*C*y,m[1]+u[1]*w*y+p[1]*C*y,m[2]+u[2]*w*y+p[2]*C*y];e.push(R[0],R[1],R[2],L[0],L[1],L[2],r.region,r.tint[0],r.tint[1],r.tint[2])}}for(let f=0;f<14;f++)for(let v=0;v<20;v++){const m=s+f*21+v,y=m+20+1;t.push(m,y,m+1,m+1,y,y+1)}}return{parts:o,vertices:new Float32Array(e),indices:new Uint32Array(t),vertexCount:e.length/10,indexCount:t.length}},ge=(o,e,t)=>{const i=fe(t),a=o.filter(h=>h.hair>0),r=h=>{const u=Math.hypot(...T(h.b,h.a));return(2*Math.PI*h.r*u+4*Math.PI*h.r*h.r)*h.hair},s=a.map(r),n=s.reduce((h,u)=>h+u,0),c=[],d=(h,u)=>{for(const p of o){if(p===u)continue;const f=te(h,p.a,p.b);if(Math.hypot(...T(h,f))<p.r*.85)return!0}return!1};for(let h=0;h<a.length;h++){const u=a[h],p=Math.round(s[h]/n*e),f=T(u.b,u.a),m=Math.hypot(...f)>1e-4?M(f):[0,1,0],y=Math.abs(m[1])>.9?[1,0,0]:[0,1,0],b=M(A(m,y)),g=A(m,b);for(let P=0;P<p;P++){let w=!1;for(let C=0;C<4&&!w;C++){const L=i()*Math.PI*2,R=i(),re=[u.a[0]+f[0]*R,u.a[1]+f[1]*R,u.a[2]+f[2]*R],j=M([b[0]*Math.cos(L)+g[0]*Math.sin(L),b[1]*Math.cos(L)+g[1]*Math.sin(L),b[2]*Math.cos(L)+g[2]*Math.sin(L)]),H=E(re,U(j,u.r));d(H,u)||(c.push({pos:H,normal:j,region:u.region}),w=!0)}}}for(;c.length<e;){const h=a[Math.floor(i()*a.length)],u=i()*Math.PI*2,p=T(h.b,h.a),f=M([p[0]||.01,p[1],p[2]]),v=Math.abs(f[1])>.9?[1,0,0]:[0,1,0],m=M(A(f,v)),y=A(f,m),b=i(),g=E(h.a,U(p,b)),P=M([m[0]*Math.cos(u)+y[0]*Math.sin(u),m[1]*Math.cos(u)+y[1]*Math.sin(u),m[2]*Math.cos(u)+y[2]*Math.sin(u)]);c.push({pos:E(g,U(P,h.r)),normal:P,region:h.region})}return c},ve=(o,e,t)=>{let i=null;for(const a of o){const r=he(e,t,a.a,a.b,a.r);if(r>0&&(!i||r<i.t)){const s=E(e,U(t,r)),n=te(s,a.a,a.b);i={t:r,point:s,normal:M(T(s,n)),region:a.region}}}return i},ye=`// 毛发物理模拟:Verlet 积分 + 距离约束 + 形状记忆 + 胶囊碰撞
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
`,be=`// 造型笔刷:剪刀/推子/梳子/染色,只改刷到的发丝
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
`,xe=`// 模板套用:按分区设置目标长度/卷曲,带混合过渡
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
`,we=`// 分区长度统计:为美容师长度分区单汇总各区域平均毛长
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
`,_=8,F=16,V=32,q=24,Se=12;class Pe{device;count=0;strandBuf;styleBuf;beforeBuf;posBuf;colliderBuf;simParamsBuf;brushBuf;templateBuf;statsBuf;statsReadBuf;simPipe;brushPipe;templatePipe;statsPipe;undoStack=[];redoStack=[];pool=[];constructor(e){this.device=e;const t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC;this.colliderBuf=e.createBuffer({size:q*48,usage:t}),this.simParamsBuf=e.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.brushBuf=e.createBuffer({size:96,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.templateBuf=e.createBuffer({size:16*16+16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.statsBuf=e.createBuffer({size:32*4,usage:t}),this.statsReadBuf=e.createBuffer({size:32*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});const i=a=>e.createComputePipeline({layout:"auto",compute:{module:e.createShaderModule({code:a}),entryPoint:"main"}});this.simPipe=i(ye),this.brushPipe=i(be),this.templatePipe=i(xe),this.statsPipe=i(we)}plant(e,t,i){this.count=e.length;const a=this.device;this.strandBuf?.destroy(),this.styleBuf?.destroy(),this.beforeBuf?.destroy(),this.posBuf?.destroy();for(const p of[...this.undoStack,...this.redoStack,...this.pool])p.destroy();this.undoStack=[],this.redoStack=[],this.pool=[];const r=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC;this.strandBuf=a.createBuffer({size:this.count*_*4,usage:r}),this.styleBuf=a.createBuffer({size:this.count*F*4,usage:r}),this.beforeBuf=a.createBuffer({size:this.count*F*4,usage:r}),this.posBuf=a.createBuffer({size:this.count*V*4,usage:r});const s=new Float32Array(this.count*_),n=new Float32Array(this.count*F),c=new Float32Array(this.count*V),[d,h,u]=t.color;for(let p=0;p<this.count;p++){const f=e[p],v=p*_;s[v]=f.pos[0],s[v+1]=f.pos[1],s[v+2]=f.pos[2],s[v+3]=f.region,s[v+4]=f.normal[0],s[v+5]=f.normal[1],s[v+6]=f.normal[2],s[v+7]=t.hair.thickness*i.thickness*(.8+Math.random()*.4);const m=p*F,y=t.hair.length*i.length*(.85+Math.random()*.3);n[m]=y,n[m+1]=Math.min(1,t.hair.curl*i.curl*(.85+Math.random()*.3)),n[m+2]=Math.min(1,t.hair.stiffness*i.stiffness),n[m+3]=Math.random(),n[m+4]=f.normal[0],n[m+5]=f.normal[1],n[m+6]=f.normal[2],n[m+7]=0;const b=.9+Math.random()*.2;n[m+8]=d*b*.82,n[m+9]=h*b*.82,n[m+10]=u*b*.82,n[m+11]=1,n[m+12]=d*b,n[m+13]=h*b,n[m+14]=u*b,n[m+15]=1;const g=p*V,P=y/3;for(let w=0;w<4;w++){const C=f.pos[0]+f.normal[0]*P*w,L=f.pos[1]+f.normal[1]*P*w,R=f.pos[2]+f.normal[2]*P*w;c[g+w*4]=C,c[g+w*4+1]=L,c[g+w*4+2]=R,c[g+w*4+3]=1,c[g+16+w*4]=C,c[g+16+w*4+1]=L,c[g+16+w*4+2]=R,c[g+16+w*4+3]=1}}a.queue.writeBuffer(this.strandBuf,0,s),a.queue.writeBuffer(this.styleBuf,0,n),a.queue.writeBuffer(this.posBuf,0,c),this.copyStyle(this.styleBuf,this.beforeBuf)}updateColliders(e){const t=new Float32Array(q*12);e.slice(0,q).forEach((i,a)=>{const r=a*12;t[r]=i.a[0],t[r+1]=i.a[1],t[r+2]=i.a[2],t[r+3]=0,t[r+4]=i.b[0],t[r+5]=i.b[1],t[r+6]=i.b[2],t[r+7]=0,t[r+8]=i.r}),this.device.queue.writeBuffer(this.colliderBuf,0,t)}copyStyle(e,t){const i=this.device.createCommandEncoder();i.copyBufferToBuffer(e,0,t,0,this.count*F*4),this.device.queue.submit([i.finish()])}allocSnap(){return this.pool.pop()??this.device.createBuffer({size:this.count*F*4,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC})}snapshot(){const e=this.allocSnap();this.copyStyle(this.styleBuf,e),this.undoStack.push(e),this.undoStack.length>Se&&this.pool.push(this.undoStack.shift());for(const t of this.redoStack)this.pool.push(t);this.redoStack=[]}undo(){const e=this.undoStack.pop();if(!e)return!1;const t=this.allocSnap();return this.copyStyle(this.styleBuf,t),this.redoStack.push(t),this.copyStyle(e,this.styleBuf),this.pool.push(e),!0}redo(){const e=this.redoStack.pop();if(!e)return!1;const t=this.allocSnap();return this.copyStyle(this.styleBuf,t),this.undoStack.push(t),this.copyStyle(e,this.styleBuf),this.pool.push(e),!0}markBefore(){this.copyStyle(this.styleBuf,this.beforeBuf)}simulate(e,t,i,a,r,s,n){if(!this.count)return;this.device.queue.writeBuffer(this.simParamsBuf,0,new Float32Array([t,i,a,r])),this.device.queue.writeBuffer(this.simParamsBuf,16,new Uint32Array([this.count,s])),this.device.queue.writeBuffer(this.simParamsBuf,24,new Float32Array([n]));const c=e.beginComputePass();c.setPipeline(this.simPipe),c.setBindGroup(0,this.device.createBindGroup({layout:this.simPipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.simParamsBuf}},{binding:1,resource:{buffer:this.colliderBuf}},{binding:2,resource:{buffer:this.strandBuf}},{binding:3,resource:{buffer:this.styleBuf}},{binding:4,resource:{buffer:this.posBuf}}]})),c.dispatchWorkgroups(Math.ceil(this.count/64)),c.end()}applyBrush(e,t,i,a,r,s,n,c,d,h){if(!this.count)return;const u=new Float32Array(24);u.set([i[0],i[1],i[2],a],0),u.set([t,r,s,n],4),u.set([c[0],c[1],c[2],0],8),u.set([d[0],d[1],d[2],1],12),u.set([h[0],h[1],h[2],1],16),this.device.queue.writeBuffer(this.brushBuf,0,u),this.device.queue.writeBuffer(this.brushBuf,80,new Uint32Array([this.count,0,0,0]));const p=e.beginComputePass();p.setPipeline(this.brushPipe),p.setBindGroup(0,this.device.createBindGroup({layout:this.brushPipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.brushBuf}},{binding:1,resource:{buffer:this.strandBuf}},{binding:2,resource:{buffer:this.styleBuf}}]})),p.dispatchWorkgroups(Math.ceil(this.count/64)),p.end()}applyTemplate(e,t){if(!this.count)return;this.device.queue.writeBuffer(this.templateBuf,0,t),this.device.queue.writeBuffer(this.templateBuf,256,new Uint32Array([this.count,0,0,0]));const i=e.beginComputePass();i.setPipeline(this.templatePipe),i.setBindGroup(0,this.device.createBindGroup({layout:this.templatePipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.templateBuf}},{binding:1,resource:{buffer:this.strandBuf}},{binding:2,resource:{buffer:this.styleBuf}}]})),i.dispatchWorkgroups(Math.ceil(this.count/64)),i.end()}async regionStats(){const e=new Uint32Array(32);this.device.queue.writeBuffer(this.statsBuf,0,e);const t=this.device.createCommandEncoder();this.device.queue.writeBuffer(this.brushBuf,0,new Uint32Array([this.count,0,0,0]));const i=t.beginComputePass();i.setPipeline(this.statsPipe),i.setBindGroup(0,this.device.createBindGroup({layout:this.statsPipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.brushBuf}},{binding:1,resource:{buffer:this.strandBuf}},{binding:2,resource:{buffer:this.styleBuf}},{binding:3,resource:{buffer:this.statsBuf}}]})),i.dispatchWorkgroups(Math.ceil(this.count/64)),i.end(),t.copyBufferToBuffer(this.statsBuf,0,this.statsReadBuf,0,128),this.device.queue.submit([t.finish()]),await this.statsReadBuf.mapAsync(GPUMapMode.READ);const a=new Uint32Array(this.statsReadBuf.getMappedRange().slice(0));this.statsReadBuf.unmap();const r=[],s=[];for(let n=0;n<16;n++){const c=a[16+n];s.push(c),r.push(c>0?a[n]/c:0)}return{avg:r,counts:s}}}const Be=`// 发丝渲染:公告板条带 + Kajiya-Kay 各向异性高光 + 深度 AO 自阴影
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
`,Me=`// 身体网格渲染:Lambert + 阴影贴图
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
`,Le=`// 阴影贴图:从光源方向渲染身体深度
struct Light { viewProj: mat4x4f }
@group(0) @binding(0) var<uniform> light: Light;

@vertex
fn vs(@location(0) pos: vec3f) -> @builtin(position) vec4f {
  return light.viewProj * vec4f(pos, 1.0);
}
`,X=2048;class Te{gpu;hair;device;frameBuf;lightBuf;shadowTex;shadowView;shadowSampler;meshPipe;hairPipe;shadowPipe;frameLayout;hairDataLayout;vb=null;ib=null;indexCount=0;constructor(e,t){this.gpu=e,this.hair=t,this.device=e.device,this.frameBuf=this.device.createBuffer({size:192,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.lightBuf=this.device.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.shadowTex=this.device.createTexture({size:[X,X],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),this.shadowView=this.shadowTex.createView(),this.shadowSampler=this.device.createSampler({compare:"less"}),this.frameLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{sampleType:"depth"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"comparison"}}]}),this.hairDataLayout=this.device.createBindGroupLayout({entries:[0,1,2].map(s=>({binding:s,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}))});const i=this.device.createShaderModule({code:Me});this.meshPipe=this.device.createRenderPipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.frameLayout]}),vertex:{module:i,entryPoint:"vs",buffers:[{arrayStride:40,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"},{shaderLocation:2,offset:24,format:"float32"},{shaderLocation:3,offset:28,format:"float32x3"}]}]},fragment:{module:i,entryPoint:"fs",targets:[{format:e.format}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}});const a=this.device.createShaderModule({code:Be});this.hairPipe=this.device.createRenderPipeline({layout:this.device.createPipelineLayout({bindGroupLayouts:[this.frameLayout,this.hairDataLayout]}),vertex:{module:a,entryPoint:"vs"},fragment:{module:a,entryPoint:"fs",targets:[{format:e.format}]},primitive:{topology:"triangle-list"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less-equal"}});const r=this.device.createShaderModule({code:Le});this.shadowPipe=this.device.createRenderPipeline({layout:"auto",vertex:{module:r,entryPoint:"vs",buffers:[{arrayStride:40,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}})}setMesh(e){this.vb?.destroy(),this.ib?.destroy(),this.vb=this.device.createBuffer({size:e.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.ib=this.device.createBuffer({size:e.indices.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.vb,0,e.vertices),this.device.queue.writeBuffer(this.ib,0,e.indices),this.indexCount=e.indexCount}lightMatrix(e){const t=[-e[0]*120,-e[1]*120,-e[2]*120];return W(de(-55,55,-55,55,1,300),ee(t,[0,15,0],[0,1,0]))}frameBindGroup(){return this.device.createBindGroup({layout:this.frameLayout,entries:[{binding:0,resource:{buffer:this.frameBuf}},{binding:1,resource:this.shadowView},{binding:2,resource:this.shadowSampler}]})}hairBindGroup(e){return this.device.createBindGroup({layout:this.hairDataLayout,entries:[{binding:0,resource:{buffer:this.hair.strandBuf}},{binding:1,resource:{buffer:e?this.hair.beforeBuf:this.hair.styleBuf}},{binding:2,resource:{buffer:this.hair.posBuf}}]})}writeFrame(e,t,i){const a=this.lightMatrix(i.lightDir),r=W(e.proj(t),e.view()),s=new Float32Array(48);s.set(r,0),s.set(a,16);const n=e.eye();s.set([n[0],n[1],n[2],1],32),s.set([i.lightDir[0],i.lightDir[1],i.lightDir[2],i.lightIntensity],36),s.set([i.ambient,i.ambient,i.ambient,i.aoStrength],40),s.set([i.time,i.hairWidthScale,.002,this.hair.count],44),this.device.queue.writeBuffer(this.frameBuf,0,s),this.device.queue.writeBuffer(this.lightBuf,0,a)}encodeScene(e,t,i){const a=this.frameBindGroup();this.vb&&this.ib&&(e.setPipeline(this.meshPipe),e.setBindGroup(0,a),e.setVertexBuffer(0,this.vb),e.setIndexBuffer(this.ib,"uint32"),e.drawIndexed(this.indexCount)),i&&this.hair.count>0&&(e.setPipeline(this.hairPipe),e.setBindGroup(0,a),e.setBindGroup(1,this.hairBindGroup(t)),e.draw(18*this.hair.count))}encodeShadow(e){if(!this.vb||!this.ib)return;const t=e.beginRenderPass({colorAttachments:[],depthStencilAttachment:{view:this.shadowView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});t.setPipeline(this.shadowPipe),t.setBindGroup(0,this.device.createBindGroup({layout:this.shadowPipe.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.lightBuf}}]})),t.setVertexBuffer(0,this.vb),t.setIndexBuffer(this.ib,"uint32"),t.drawIndexed(this.indexCount),t.end()}render(e,t){this.gpu.resize();const{width:i,height:a}=this.gpu;this.writeFrame(e,i/a,t);const r=this.device.createCommandEncoder();this.encodeShadow(r);const s=r.beginRenderPass({colorAttachments:[{view:this.gpu.context.getCurrentTexture().createView(),clearValue:t.clearColor,loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:this.gpu.depthView,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});if(t.split){const n=Math.floor(i/2);s.setViewport(0,0,n,a,0,1),s.setScissorRect(0,0,n,a),this.encodeScene(s,!0,!0),s.setViewport(n,0,i-n,a,0,1),s.setScissorRect(n,0,i-n,a),this.encodeScene(s,!1,!0)}else this.encodeScene(s,!1,!0);s.end(),this.device.queue.submit([r.finish()])}async renderToPixels(e,t,i,a){this.writeFrame(e,i/a,t);const r=this.device.createTexture({size:[i,a],format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.COPY_SRC}),s=this.device.createTexture({size:[i,a],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),n=this.device.createCommandEncoder();this.encodeShadow(n);const c=n.beginRenderPass({colorAttachments:[{view:r.createView(),clearValue:t.clearColor,loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:s.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});this.encodeScene(c,!1,!0),c.end();const d=Math.ceil(i*4/256)*256,h=this.device.createBuffer({size:d*a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});n.copyTextureToBuffer({texture:r},{buffer:h,bytesPerRow:d},[i,a]),this.device.queue.submit([n.finish()]),await h.mapAsync(GPUMapMode.READ);const u=new Uint8Array(h.getMappedRange()),p=new Uint8ClampedArray(i*a*4);for(let f=0;f<a;f++)p.set(u.subarray(f*d,f*d+i*4),f*i*4);return h.unmap(),h.destroy(),r.destroy(),s.destroy(),p}}const se="pet-groom:profiles",ne="pet-groom:settings",K=()=>({strandCount:3e5,iterations:2,gravity:260,hairWidth:1,aoStrength:.55,lightIntensity:1.1,ambient:.35,showFps:!0,bg:"#1c1e24",lightYaw:.7,lightPitch:.9}),Ce=()=>{try{const o=localStorage.getItem(ne);if(o)return{...K(),...JSON.parse(o)}}catch{}return K()},Ne=o=>localStorage.setItem(ne,JSON.stringify(o)),ze=()=>{try{const o=localStorage.getItem(se);if(o)return JSON.parse(o)}catch{}return[]},Re=o=>localStorage.setItem(se,JSON.stringify(o)),Ee=(o,e)=>{const t=I[o],i=new Date().toISOString();return{id:`p${Date.now().toString(36)}${Math.floor(Math.random()*1e4)}`,name:e,breed:o,body:{...t.body},hairScale:{length:1,thickness:1,curl:1,stiffness:1},templateId:"natural",rootColor:[...t.color],tipColor:[...t.color],strokes:[],createdAt:i,updatedAt:i}},J=o=>{const e=new Blob([JSON.stringify(o,null,2)],{type:"application/json"}),t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=`${o.name||"宠物档案"}.json`,t.click(),URL.revokeObjectURL(t.href)},Ue=async o=>{const e=JSON.parse(await o.text());if(!e.id||!e.breed||!I[e.breed])throw new Error("档案格式不正确");return e.id=`p${Date.now().toString(36)}`,e},G=(o,e,t,i,a,r,s)=>{const n=[],c=d=>n.push([d,1,1,1]);for(c(o),c(e),c(t),c(i),c(i),c(a),c(a),c(a),c(a),c(r),c(s);n.length<16;)n.push([2.5,1,1,1]);return n},D=[{id:"natural",name:"自然装",desc:"保持品种原始毛长",regions:G(3,3.5,2,4,2.5,3,3)},{id:"teddy-bear",name:"泰迪熊头",desc:"圆头圆耳,身体蓬松",regions:G(2.5,4.5,2.5,5,3,3.5,3.5)},{id:"lion",name:"狮子装",desc:"头颈鬃毛,躯干剃短,尾尖留球",regions:(()=>{const o=G(1.2,6,3,2,1.5,1.2,6);return o[9]=[4,1,1,1],o})()},{id:"bichon-round",name:"比熊圆头",desc:"整体圆润,头部大圆",regions:G(3.5,5,3,5,3.5,4,4)},{id:"schnauzer-std",name:"雪纳瑞标准装",desc:"胡须眉毛留长,躯干贴短",regions:G(1.5,2,4.5,1.5,3,1.5,2)},{id:"summer",name:"清爽短装",desc:"全身统一短毛,夏季清凉",regions:G(1,1.2,.8,1,1,1.2,1)}],Z=o=>{const e=new Float32Array(64);return o.regions.forEach((t,i)=>e.set(t,i*4)),e},Ae=o=>{const e=parseInt(o.slice(1),16);return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]};class ke{gpu;camera=new ue;hair;renderer;settings=Ce();profiles=ze();profile=null;parts=[];page="profiles";tool={tool:1,radius:3,value:.3,strength:1,regionMask:-1,color0:[.8,.2,.2],color1:[.9,.5,.1]};split=!1;autoRotate=!1;fps=0;onFps=null;onChange=null;painting=!1;lastHit=null;strokeDirty=!1;async init(e){this.gpu=await oe(e),this.hair=new Pe(this.gpu.device),this.renderer=new Te(this.gpu,this.hair),this.bindInput(e),this.profiles.length>0&&this.setProfile(this.profiles[0]),requestAnimationFrame(this.loop)}persist(){Re(this.profiles),Ne(this.settings)}setProfile(e){this.profile=e,this.profiles.find(t=>t.id===e.id)||(this.profiles.push(e),this.persist()),this.rebuild()}rebuild(){const e=this.profile;if(!e)return;const t=I[e.breed];this.parts=pe(e.body);const i=me(this.parts);this.renderer.setMesh(i);let a=0;for(const c of e.id)a=a*31+c.charCodeAt(0)>>>0;const r=ge(this.parts,this.settings.strandCount,a);this.hair.plant(r,t,e.hairScale),this.hair.updateColliders(this.parts.map(c=>({a:c.a,b:c.b,r:c.r})));const s=this.gpu.device.createCommandEncoder(),n=D.find(c=>c.id===e.templateId)??D[0];this.hair.applyTemplate(s,Z(n)),this.gpu.device.queue.submit([s.finish()]);for(const c of e.strokes.slice(-400))this.replayStroke(c);this.hair.markBefore(),this.onChange?.()}replayStroke(e){const t=this.gpu.device.createCommandEncoder();this.hair.applyBrush(t,e.t,e.p,e.r,e.v,e.s,e.m,e.g,e.c0,e.c1),this.gpu.device.queue.submit([t.finish()])}applyTemplate(e){const t=this.profile;if(!t)return;t.templateId=e,this.hair.snapshot();const i=D.find(a=>a.id===e);if(i){const a=this.gpu.device.createCommandEncoder();this.hair.applyTemplate(a,Z(i)),this.gpu.device.queue.submit([a.finish()])}this.touch()}undo(){this.hair.undo()&&(this.profile?.strokes.pop(),this.onChange?.())}redo(){this.hair.redo()&&this.onChange?.()}touch(){this.profile&&(this.profile.updatedAt=new Date().toISOString()),this.persist(),this.onChange?.()}markBefore(){this.hair.markBefore(),this.touch()}bindInput(e){let t=!1,i=0,a=0;e.addEventListener("pointerdown",s=>{e.setPointerCapture(s.pointerId),i=s.clientX,a=s.clientY,(this.page==="groom"||this.page==="dye")&&s.button===0&&!s.shiftKey&&this.profile?(this.painting=!0,this.hair.snapshot(),this.paintAt(s,null)):t=!0}),e.addEventListener("pointermove",s=>{const n=s.clientX-i,c=s.clientY-a;i=s.clientX,a=s.clientY,this.painting?this.paintAt(s,[n,c]):t&&(this.camera.yaw-=n*.008,this.camera.pitch=Math.max(-1.4,Math.min(1.4,this.camera.pitch+c*.008)))});const r=()=>{this.painting&&this.strokeDirty&&(this.strokeDirty=!1,this.touch()),this.painting=!1,t=!1,this.lastHit=null};e.addEventListener("pointerup",r),e.addEventListener("pointercancel",r),e.addEventListener("wheel",s=>{s.preventDefault(),this.camera.dist=Math.max(30,Math.min(300,this.camera.dist*(1+s.deltaY*.001)))},{passive:!1})}paintAt(e,t){const i=this.gpu.canvas.getBoundingClientRect(),a=(e.clientX-i.left)/i.width*2-1,r=1-(e.clientY-i.top)/i.height*2,{ro:s,rd:n}=this.camera.ray(a,r,i.width/i.height),c=ve(this.parts,s,n);if(!c)return;const d=this.tool,h=this.page==="dye"?3:d.tool;let u=[0,-1,0];if(this.lastHit)u=M(T(c.point,this.lastHit));else if(t){const v=this.camera.right();u=M([v[0]*t[0],-t[1],v[2]*t[0]])}this.lastHit=c.point;const p={p:c.point,g:u,t:h,r:d.radius,v:d.value,s:d.strength,m:d.regionMask,c0:d.color0,c1:d.color1};this.profile?.strokes.push(p),this.profile&&this.profile.strokes.length>400&&this.profile.strokes.shift();const f=this.gpu.device.createCommandEncoder();this.hair.applyBrush(f,h,c.point,d.radius,d.value,d.strength,d.regionMask,u,d.color0,d.color1),this.gpu.device.queue.submit([f.finish()]),this.strokeDirty=!0}last=performance.now();loop=e=>{const t=Math.min(.033,(e-this.last)/1e3);this.last=e,this.fps=this.fps*.92+1/Math.max(t,1e-4)*.08,this.onFps?.(this.fps),this.autoRotate&&(this.camera.yaw+=t*.5);const i=this.settings,a=this.gpu.device.createCommandEncoder();this.hair.simulate(a,t,i.gravity,.96,i.iterations,this.parts.length,e/1e3),this.gpu.device.queue.submit([a.finish()]);const r=Math.cos(i.lightPitch),s=M([r*Math.sin(i.lightYaw),-Math.sin(i.lightPitch),r*Math.cos(i.lightYaw)]);this.renderer.render(this.camera,{time:e/1e3,lightDir:s,lightIntensity:i.lightIntensity,ambient:i.ambient,aoStrength:i.aoStrength,hairWidthScale:i.hairWidth,split:this.page==="preview"&&this.split,clearColor:this.bgColor()}),requestAnimationFrame(this.loop)};bgColor(){const[e,t,i]=Ae(this.settings.bg);return{r:e,g:t,b:i,a:1}}}const l=(o,e={},...t)=>{const i=document.createElement(o);for(const[a,r]of Object.entries(e))a==="className"?i.className=r:i.setAttribute(a,r);for(const a of t)i.append(a);return i},O=(o,e=22)=>{const t=document.createElementNS("http://www.w3.org/2000/svg","svg");return t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("width",String(e)),t.setAttribute("height",String(e)),t.innerHTML=o,t},k={scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.5 15.5M14.5 14.5 20 20M8.5 8.5 12 12"/>',clipper:'<rect x="7" y="8" width="10" height="12" rx="2"/><path d="M7 8V6l2-2h6l2 2v2M9 4v2M12 4v2M15 4v2"/>',comb:'<path d="M5 4h14v4H5zM7 8v12M10 8v8M13 8v12M16 8v8M19 8v12"/>',pet:'<circle cx="12" cy="13" r="6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="4.5" cy="11.5" r="1.6"/><circle cx="19.5" cy="11.5" r="1.6"/>',export:'<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',trash:'<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13h8l1-13"/>'},x=(o,e,t,i,a,r,s=n=>n.toFixed(1))=>{const n=l("span",{className:"val"},s(a)),c=l("input",{type:"range",min:String(e),max:String(t),step:String(i),value:String(a)});return c.addEventListener("input",()=>{const d=parseFloat(c.value);n.textContent=s(d),r(d)}),l("div",{className:"field"},l("label",{},document.createTextNode(o),n),c)},B=(o,e,t)=>{const i=l("button",{className:`btn ${e}`,type:"button"},o);return i.addEventListener("click",t),i},z=o=>{const e=l("div",{className:"toast"},o);document.body.append(e),setTimeout(()=>e.remove(),2200)},S=(o,...e)=>l("div",{className:"section"},l("div",{className:"section-title"},o),...e),Fe=o=>"#"+o.map(e=>Math.round(Math.max(0,Math.min(1,e))*255).toString(16).padStart(2,"0")).join(""),Y=o=>{const e=parseInt(o.slice(1),16);return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]},Ge=(o,e)=>{const t=()=>{o.replaceChildren(a())},i=()=>{const r=l("input",{type:"text",placeholder:"宠物名字,如:豆豆",value:""}),s=l("select",{},...Object.values(I).map(d=>l("option",{value:d.id},d.name))),n=l("div",{},l("div",{className:"field"},l("label",{},"名字"),r),l("div",{className:"field"},l("label",{},"品种(自动生成对应体型)"),s)),c=B("创建档案","primary block",()=>{const d=r.value.trim()||I[s.value].name,h=Ee(s.value,d);e.profiles.push(h),e.persist(),e.setProfile(h),z(`已创建「${d}」`),t()});return l("div",{},n,c)},a=()=>{const r=l("div",{className:"panel"},l("h2",{},"宠物档案"),l("p",{className:"sub"},"管理门店客人的宠物档案,支持导入导出。选中档案后进入造型。"));r.append(S("新建档案",i()));const s=l("div",{className:"pet-list"});e.profiles.length===0&&s.append(l("div",{className:"empty"},O(k.pet,48),l("div",{className:"title"},"还没有宠物档案"),l("div",{className:"desc"},"在上方创建第一份档案")));for(const c of e.profiles){const d=l("div",{className:`pet-item${e.profile?.id===c.id?" active":""}`},l("div",{className:"pet-avatar"},O(k.pet)),l("div",{className:"pet-info"},l("div",{className:"pet-name"},c.name),l("div",{className:"pet-meta"},`${I[c.breed].name} · ${c.strokes.length} 次调整`)),l("div",{className:"pet-actions"})),h=d.querySelector(".pet-actions"),u=l("button",{className:"icon-btn",title:"导出档案",type:"button"},O(k.export,16));u.addEventListener("click",f=>{f.stopPropagation(),J(c)});const p=l("button",{className:"icon-btn danger",title:"删除",type:"button"},O(k.trash,16));p.addEventListener("click",f=>{f.stopPropagation(),e.profiles=e.profiles.filter(v=>v.id!==c.id),e.profile?.id===c.id&&(e.profile=e.profiles[0]??null),e.profile&&e.setProfile(e.profile),e.persist(),t()}),h.append(u,p),d.addEventListener("click",()=>{e.setProfile(c),z(`当前宠物:${c.name}`),t()}),s.append(d)}r.append(S("档案列表",s));const n=l("input",{type:"file",accept:".json",style:"display:none"});return n.addEventListener("change",async()=>{const c=n.files?.[0];if(c)try{const d=await Ue(c);e.profiles.push(d),e.persist(),e.setProfile(d),z(`已导入「${d.name}」`),t()}catch(d){z(d instanceof Error?d.message:"导入失败")}}),r.append(l("div",{className:"btn-row"},B("导入档案","",()=>n.click()),B("导出当前档案","",()=>{e.profile?J(e.profile):z("请先选择档案")})),n),r};o.append(a())},Ie=(o,e)=>{const t=e.profile,i=l("div",{className:"panel"},l("h2",{},"体型编辑"),l("p",{className:"sub"},t?`调整「${t.name}」的四肢与头身比例,模型与毛发会实时重建,已有造型尽量保留。`:"请先在「宠物档案」页选择或创建档案。"));if(!t){o.append(i);return}let a=0;const r=()=>{clearTimeout(a),a=window.setTimeout(()=>e.rebuild(),120)},s=t.body;i.append(S("躯干",x("躯干长度",18,40,.5,s.bodyLen,n=>{s.bodyLen=n,r()},n=>`${n.toFixed(1)} cm`),x("躯干围度",6,13,.1,s.girth,n=>{s.girth=n,r()},n=>`${n.toFixed(1)} cm`),x("颈部长度",2,10,.5,s.neckLen,n=>{s.neckLen=n,r()},n=>`${n.toFixed(1)} cm`))),i.append(S("头部",x("头部大小",.7,1.4,.02,s.headScale,n=>{s.headScale=n,r()},n=>`${(n*100).toFixed(0)}%`),x("吻部长度",2,9,.1,s.muzzleLen,n=>{s.muzzleLen=n,r()},n=>`${n.toFixed(1)} cm`),x("耳朵长度",3,11,.1,s.earLen,n=>{s.earLen=n,r()},n=>`${n.toFixed(1)} cm`),x("耳朵下垂度",0,1,.05,s.earDroop,n=>{s.earDroop=n,r()},n=>n<.4?"立耳":n<.7?"半垂":"垂耳"))),i.append(S("四肢与尾巴",x("腿部长度",8,22,.5,s.legLen,n=>{s.legLen=n,r()},n=>`${n.toFixed(1)} cm`),x("腿部粗细",1.5,3.5,.1,s.legR,n=>{s.legR=n,r()},n=>`${n.toFixed(1)} cm`),x("尾巴长度",2,12,.5,s.tailLen,n=>{s.tailLen=n,r()},n=>`${n.toFixed(1)} cm`))),i.append(S("毛发基础",x("整体毛长倍率",.5,2,.05,t.hairScale.length,n=>{t.hairScale.length=n,r()},n=>`${(n*100).toFixed(0)}%`),x("毛发粗细倍率",.5,2,.05,t.hairScale.thickness,n=>{t.hairScale.thickness=n,r()},n=>`${(n*100).toFixed(0)}%`),x("卷曲度倍率",.2,2,.05,t.hairScale.curl,n=>{t.hairScale.curl=n,r()},n=>`${(n*100).toFixed(0)}%`),x("硬度倍率",.2,2,.05,t.hairScale.stiffness,n=>{t.hairScale.stiffness=n,r()},n=>`${(n*100).toFixed(0)}%`))),o.append(i)},Oe=[3,6,9,13],De=(o,e)=>{const t=l("div",{className:"panel"},l("h2",{},"毛发造型"),l("p",{className:"sub"},"左键在模型上刷动造型,Shift+左键或右键旋转视角,滚轮缩放。"));if(!e.profile){t.append(l("p",{className:"sub"},"请先在「宠物档案」页选择或创建档案。")),o.append(t);return}const i=[{id:0,name:"剪刀",icon:k.scissors},{id:1,name:"推子",icon:k.clipper},{id:2,name:"梳子",icon:k.comb}],a=l("div",{className:"tool-grid"}),r=l("div",{}),s=()=>{r.replaceChildren();const h=e.tool;if(h.tool===0)r.append(x("单次剪掉量",.2,3,.1,h.value,u=>{h.value=u},u=>`${(u*10).toFixed(0)} mm`));else if(h.tool===1){const u=l("div",{className:"btn-row"});for(const p of Oe){const f=B(`${p}mm`,Math.abs(h.value*10-p)<.01?"primary":"",()=>{h.value=p/10,s()});u.append(f)}r.append(l("div",{className:"field"},l("label",{},"刀头规格"),u))}else r.append(x("梳理强度",.1,1,.05,h.strength,u=>{h.strength=u},u=>`${(u*100).toFixed(0)}%`))},n=()=>{a.replaceChildren();for(const h of i){const u=l("button",{className:`tool-btn${e.tool.tool===h.id?" active":""}`,type:"button"},O(h.icon),h.name);u.addEventListener("click",()=>{e.tool.tool=h.id,n(),s()}),a.append(u)}};n(),s(),t.append(S("造型工具",a,r));const c=l("select",{},l("option",{value:"-1"},"全部区域"),...$.map((h,u)=>l("option",{value:String(u)},h)));c.addEventListener("change",()=>{e.tool.regionMask=parseInt(c.value,10)}),t.append(S("笔刷",x("笔刷半径",1,8,.5,e.tool.radius,h=>{e.tool.radius=h},h=>`${h.toFixed(1)} cm`),l("div",{className:"field"},l("label",{},"作用区域"),c)));const d=l("div",{className:"tmpl-grid"});for(const h of D){const u=l("div",{className:`tmpl-card${e.profile.templateId===h.id?" active":""}`},l("div",{className:"name"},h.name),l("div",{className:"desc"},h.desc));u.addEventListener("click",()=>{e.applyTemplate(h.id),d.querySelectorAll(".tmpl-card").forEach(p=>p.classList.remove("active")),u.classList.add("active"),z(`已套用「${h.name}」,可继续微调`)}),d.append(u)}t.append(S("造型模板",d)),t.append(S("操作",l("div",{className:"btn-row"},B("撤销","",()=>e.undo()),B("重做","",()=>e.redo())),l("div",{style:"height:8px"}),l("div",{className:"btn-row"},B("保存为造型基准","primary",()=>{e.markBefore(),z("已保存,预览页可对比造型前后")})))),o.append(t)},$e=[["樱花粉","#e88aa5","#f7d6e0"],["雾霾蓝","#5b7fa6","#b8d0e8"],["焦糖渐变","#8a5a2e","#d9a05b"],["薄藤紫","#8a6cae","#d3c2e8"],["奶油白金","#c9b189","#f2e8d5"],["墨黑挑染","#2b2b30","#6e6e78"]],_e=(o,e)=>{const t=l("div",{className:"panel"},l("h2",{},"染色"),l("p",{className:"sub"},"左键在模型上刷染,毛根毛尖可分别设色形成渐变。Shift+左键旋转视角。"));if(!e.profile){t.append(l("p",{className:"sub"},"请先在「宠物档案」页选择或创建档案。")),o.append(t);return}const i=(s,n,c)=>{const d=l("input",{type:"color",value:Fe(n())});return d.addEventListener("input",()=>c(Y(d.value))),l("div",{className:"field"},l("label",{},s),d)};t.append(S("颜色",i("毛根色",()=>e.tool.color0,s=>{e.tool.color0=s}),i("毛尖色",()=>e.tool.color1,s=>{e.tool.color1=s})));const a=l("div",{className:"tmpl-grid"});for(const[s,n,c]of $e){const d=l("div",{className:"tmpl-card"},l("div",{className:"name"},s),l("div",{style:`height:14px;border-radius:4px;margin-top:4px;background:linear-gradient(90deg,${n},${c})`}));d.addEventListener("click",()=>{e.tool.color0=Y(n),e.tool.color1=Y(c),z(`已选「${s}」,在模型上刷染`)}),a.append(d)}t.append(S("流行色板",a));const r=l("select",{},l("option",{value:"-1"},"全部区域"),...$.map((s,n)=>l("option",{value:String(n)},s)));r.addEventListener("change",()=>{e.tool.regionMask=parseInt(r.value,10)}),t.append(S("笔刷",x("笔刷半径",1,8,.5,e.tool.radius,s=>{e.tool.radius=s},s=>`${s.toFixed(1)} cm`),x("染色强度",.1,1,.05,e.tool.strength,s=>{e.tool.strength=s},s=>`${(s*100).toFixed(0)}%`),l("div",{className:"field"},l("label",{},"作用区域"),r))),t.append(S("操作",l("div",{className:"btn-row"},B("撤销","",()=>e.undo()),B("重做","",()=>e.redo())),l("div",{style:"height:8px"}),B("恢复原毛色","block",()=>{const s=e.profile;if(!s)return;e.hair.snapshot();const n=e.gpu.device.createCommandEncoder();e.hair.applyBrush(n,3,[0,15,0],200,0,1,-1,[0,-1,0],[...s.rootColor],[...s.tipColor]),e.gpu.device.queue.submit([n.finish()]),z("已恢复原毛色")}))),o.append(t)},ie=(o,e)=>{const t=document.createElement("a");t.href=o,t.download=e,t.click(),setTimeout(()=>URL.revokeObjectURL(o),5e3)},Ve=async o=>{const e=[["正面",0],["右侧",Math.PI/2],["背面",Math.PI],["左侧",-Math.PI/2]],t=800,i=600,a=o.camera.yaw,r=document.createElement("canvas");r.width=t*2,r.height=i*2+96;const s=r.getContext("2d");s.fillStyle="#ffffff",s.fillRect(0,0,r.width,r.height);for(let n=0;n<e.length;n++){o.camera.yaw=e[n][1];const c=await o.renderer.renderToPixels(o.camera,{time:performance.now()/1e3,lightDir:[.4,-.8,.3],lightIntensity:o.settings.lightIntensity,ambient:o.settings.ambient,aoStrength:o.settings.aoStrength,hairWidthScale:o.settings.hairWidth,clearColor:o.bgColor()},t,i),d=new ImageData(c,t,i),h=document.createElement("canvas");h.width=t,h.height=i,h.getContext("2d").putImageData(d,0,0);const u=n%2*t,p=Math.floor(n/2)*i+48;s.drawImage(h,u,p),s.fillStyle="#334155",s.font="28px sans-serif",s.fillText(e[n][0],u+16,p+38)}o.camera.yaw=a,s.fillStyle="#0f172a",s.font="bold 30px sans-serif",s.fillText(`${o.profile?.name??"宠物"} 造型效果图`,16,34),r.toBlob(n=>{n&&ie(URL.createObjectURL(n),`${o.profile?.name??"pet"}-四视角效果图.png`)},"image/png"),z("四视角效果图已导出")},qe=async o=>{const{avg:e,counts:t}=await o.hair.regionStats(),i=[`宠物,${o.profile?.name??""}`,`品种,${o.profile?.breed??""}`,`日期,${new Date().toLocaleString("zh-CN")}`,"","分区,平均毛长(mm),发丝数"];$.forEach((s,n)=>{t[n]>0&&i.push(`${s},${e[n].toFixed(1)},${t[n]}`)});const a="\uFEFF"+i.join(`
`),r=new Blob([a],{type:"text/csv;charset=utf-8"});ie(URL.createObjectURL(r),`${o.profile?.name??"pet"}-长度分区单.csv`),z("长度分区单已导出")},Ye=[["正面",0],["背面",Math.PI],["左侧",-Math.PI/2],["右侧",Math.PI/2]],je=(o,e)=>{const t=l("div",{className:"panel"},l("h2",{},"效果预览"),l("p",{className:"sub"},"分屏左侧为造型前基准,右侧为当前造型。可切换固定视角或自动旋转。"));if(!e.profile){t.append(l("p",{className:"sub"},"请先在「宠物档案」页选择或创建档案。")),o.append(t);return}const i=l("div",{className:"btn-row"});for(const[c,d]of Ye)i.append(B(c,"",()=>{e.autoRotate=!1,e.camera.yaw=d,e.camera.pitch=.2}));t.append(S("固定视角",i));const a=B("自动旋转:关","block",()=>{});a.addEventListener("click",()=>{e.autoRotate=!e.autoRotate,a.textContent=`自动旋转:${e.autoRotate?"开":"关"}`});const r=B("前后对比分屏:关","block primary",()=>{});r.addEventListener("click",()=>{e.split=!e.split,r.textContent=`前后对比分屏:${e.split?"开":"关"}`}),t.append(S("展示",r,l("div",{style:"height:8px"}),a));const s=l("div",{}),n=async()=>{const{avg:c,counts:d}=await e.hair.regionStats(),h=l("table",{className:"stat-table"},l("tr",{},l("th",{},"分区"),l("th",{},"平均毛长"),l("th",{},"发丝数")));$.forEach((u,p)=>{d[p]>0&&h.append(l("tr",{},l("td",{},u),l("td",{},`${c[p].toFixed(1)} mm`),l("td",{},d[p].toLocaleString())))}),s.replaceChildren(h)};t.append(S("长度分区",l("div",{className:"btn-row"},B("刷新统计","",()=>{n()})),l("div",{style:"height:8px"}),s)),n(),t.append(S("导出",l("div",{className:"btn-row"},B("四视角效果图","primary",()=>{Ve(e)}),B("长度分区单 CSV","",()=>{qe(e)})),l("p",{className:"sub",style:"margin-top:12px"},"效果图包含前/右/后/左四个角度;长度分区单可直接交给美容师按区下剪。"))),o.append(t)},He=[5e4,1e5,2e5,3e5],We=(o,e)=>{const t=e.settings,i=l("div",{className:"panel"},l("h2",{},"设置"),l("p",{className:"sub"},"调整毛发规模与渲染质量。修改发丝数量后会重新植发,当前造型将按模板重置。")),a=l("select",{},...He.map(n=>l("option",{value:String(n),...t.strandCount===n?{selected:""}:{}},`${(n/1e4).toFixed(0)} 万根`)));a.addEventListener("change",()=>{t.strandCount=parseInt(a.value,10),e.persist(),e.rebuild(),z(`已切换为 ${(t.strandCount/1e4).toFixed(0)} 万根发丝`)}),i.append(S("毛发规模",l("div",{className:"field"},l("label",{},"发丝数量(30 万为目标性能档)"),a),x("物理迭代次数",1,4,1,t.iterations,n=>{t.iterations=n,e.persist()},n=>`${n} 次`),x("重力强度",0,600,10,t.gravity,n=>{t.gravity=n,e.persist()},n=>`${n.toFixed(0)}`))),i.append(S("渲染质量",x("发丝宽度",.5,2.5,.1,t.hairWidth,n=>{t.hairWidth=n,e.persist()},n=>`${(n*100).toFixed(0)}%`),x("自阴影强度",0,1,.05,t.aoStrength,n=>{t.aoStrength=n,e.persist()},n=>`${(n*100).toFixed(0)}%`),x("光照强度",.2,2,.05,t.lightIntensity,n=>{t.lightIntensity=n,e.persist()},n=>`${(n*100).toFixed(0)}%`),x("环境光",.1,.8,.05,t.ambient,n=>{t.ambient=n,e.persist()},n=>`${(n*100).toFixed(0)}%`),x("光源方向",0,6.28,.05,t.lightYaw,n=>{t.lightYaw=n,e.persist()},n=>`${(n*57.3).toFixed(0)}°`),x("光源高度",.2,1.5,.05,t.lightPitch,n=>{t.lightPitch=n,e.persist()},n=>`${(n*57.3).toFixed(0)}°`)));const r=l("input",{type:"color",value:t.bg});r.addEventListener("input",()=>{t.bg=r.value,e.persist()});const s=l("select",{},l("option",{value:"1",...t.showFps?{selected:""}:{}},"显示"),l("option",{value:"0",...t.showFps?{}:{selected:""}},"隐藏"));s.addEventListener("change",()=>{t.showFps=s.value==="1",e.persist(),e.onChange?.()}),i.append(S("显示",l("div",{className:"field"},l("label",{},"背景色"),r),l("div",{className:"field"},l("label",{},"帧率角标"),s))),o.append(i)},Q=[["profiles","宠物档案"],["body","体型编辑"],["groom","毛发造型"],["dye","染色"],["preview","效果预览"],["settings","设置"]],Xe={profiles:Ge,body:Ie,groom:De,dye:_e,preview:je,settings:We},Ke=async()=>{const o=document.getElementById("app"),e=l("canvas",{id:"scene-canvas"}),t=l("nav",{className:"topbar"}),i=l("div",{id:"panel-root"}),a=l("div",{className:"fps-badge"},"-- FPS"),r=l("div",{className:"hint-bar"},"左键造型 · Shift+左键/右键旋转 · 滚轮缩放");o.append(e,t,i,a,r);const s=new ke;try{await s.init(e)}catch(d){o.append(l("div",{className:"panel"},l("h2",{},"无法启动"),l("p",{className:"sub"},d instanceof Error?d.message:"WebGPU 初始化失败")));return}const n=()=>{const d=location.hash.replace("#/","");return Q.some(([h])=>h===d)?d:"profiles"},c=()=>{const d=n();s.page=d,s.split=d==="preview"?s.split:!1,t.replaceChildren(...Q.map(([h,u])=>l("a",{href:`#/${h}`,className:h===d?"active":""},u))),i.replaceChildren(),Xe[d](i,s),a.style.display=s.settings.showFps?"":"none",r.style.display=d==="groom"||d==="dye"?"":"none"};s.onFps=d=>{if(!s.settings.showFps)return;const h=d>=30;a.innerHTML=`<span class="${h?"ok":"bad"}">${d.toFixed(0)}</span> FPS · ${(s.hair.count/1e4).toFixed(0)}万根`},s.onChange=()=>{},window.addEventListener("hashchange",c),c()};Ke();
