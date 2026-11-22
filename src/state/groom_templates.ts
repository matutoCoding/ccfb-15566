// 造型模板:按 16 分区定义目标长度/卷曲/刚度,泰迪熊头、狮子头等一键套用
// 分区顺序:0躯干 1头 2吻部 3左耳 4右耳 5左前腿 6右前腿 7左后腿 8右后腿 9尾巴 10颈部 11-15预留
export interface GroomTemplate {
  id: string;
  name: string;
  desc: string;
  // [目标长度cm, 卷曲倍率, 混合度, 刚度倍率]
  regions: [number, number, number, number][];
}

const R = (body: number, head: number, muzzle: number, ear: number, leg: number, tail: number, neck: number): [number, number, number, number][] => {
  const rows: [number, number, number, number][] = [];
  const put = (len: number) => rows.push([len, 1, 1, 1]);
  put(body); put(head); put(muzzle); put(ear); put(ear);
  put(leg); put(leg); put(leg); put(leg);
  put(tail); put(neck);
  while (rows.length < 16) rows.push([2.5, 1, 1, 1]);
  return rows;
};

export const TEMPLATES: GroomTemplate[] = [
  { id: "natural", name: "自然装", desc: "保持品种原始毛长", regions: R(3, 3.5, 2, 4, 2.5, 3, 3) },
  { id: "teddy-bear", name: "泰迪熊头", desc: "圆头圆耳,身体蓬松", regions: R(2.5, 4.5, 2.5, 5, 3, 3.5, 3.5) },
  { id: "lion", name: "狮子装", desc: "头颈鬃毛,躯干剃短,尾尖留球", regions: (() => {
    const r = R(1.2, 6, 3, 2, 1.5, 1.2, 6);
    r[9] = [4, 1, 1, 1]; // 尾尖毛球
    return r;
  })() },
  { id: "bichon-round", name: "比熊圆头", desc: "整体圆润,头部大圆", regions: R(3.5, 5, 3, 5, 3.5, 4, 4) },
  { id: "schnauzer-std", name: "雪纳瑞标准装", desc: "胡须眉毛留长,躯干贴短", regions: R(1.5, 2, 4.5, 1.5, 3, 1.5, 2) },
  { id: "summer", name: "清爽短装", desc: "全身统一短毛,夏季清凉", regions: R(1, 1.2, 0.8, 1, 1, 1.2, 1) },
];

export const templateRegions = (t: GroomTemplate): Float32Array<ArrayBuffer> => {
  const data = new Float32Array(16 * 4);
  t.regions.forEach((r, i) => data.set(r, i * 4));
  return data;
};
