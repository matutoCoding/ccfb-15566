// 轨道相机:拖拽旋转 / 滚轮缩放 / 右键平移
import { Mat4, Vec3, mat4LookAt, mat4Perspective } from "./math";

export class OrbitCamera {
  yaw = 0.6;
  pitch = 0.25;
  dist = 90;
  target: Vec3 = [0, 14, 0];
  fov = Math.PI / 4;

  view(): Mat4 {
    return mat4LookAt(this.eye(), this.target, [0, 1, 0]);
  }

  proj(aspect: number): Mat4 {
    return mat4Perspective(this.fov, aspect, 0.5, 800);
  }

  eye(): Vec3 {
    const cp = Math.cos(this.pitch);
    return [
      this.target[0] + this.dist * cp * Math.sin(this.yaw),
      this.target[1] + this.dist * Math.sin(this.pitch),
      this.target[2] + this.dist * cp * Math.cos(this.yaw),
    ];
  }

  // 相机基向量,用于把屏幕拖拽转成世界方向
  right(): Vec3 {
    return [Math.cos(this.yaw), 0, -Math.sin(this.yaw)];
  }

  // 由屏幕点构造世界射线(用于笔刷拾取)
  ray(nx: number, ny: number, aspect: number): { ro: Vec3; rd: Vec3 } {
    const ro = this.eye();
    const t = Math.tan(this.fov / 2);
    const fwd: Vec3 = [
      this.target[0] - ro[0],
      this.target[1] - ro[1],
      this.target[2] - ro[2],
    ];
    const fl = Math.hypot(...fwd);
    const f: Vec3 = [fwd[0] / fl, fwd[1] / fl, fwd[2] / fl];
    const r = this.right();
    const u: Vec3 = [
      r[1] * f[2] - r[2] * f[1],
      r[2] * f[0] - r[0] * f[2],
      r[0] * f[1] - r[1] * f[0],
    ];
    const px = nx * t * aspect;
    const py = ny * t;
    const d: Vec3 = [
      f[0] + r[0] * px + u[0] * py,
      f[1] + r[1] * px + u[1] * py,
      f[2] + r[2] * px + u[2] * py,
    ];
    const dl = Math.hypot(...d);
    return { ro, rd: [d[0] / dl, d[1] / dl, d[2] / dl] };
  }
}
