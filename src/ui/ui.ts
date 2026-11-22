// DOM 助手
export const h = (tag: string, attrs: Record<string, string> = {}, ...children: (Node | string)[]): HTMLElement => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") el.className = v;
    else el.setAttribute(k, v);
  }
  for (const c of children) el.append(c);
  return el;
};

export const svgIcon = (paths: string, size = 22): SVGSVGElement => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.innerHTML = paths;
  return svg;
};

export const ICONS = {
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.5 15.5M14.5 14.5 20 20M8.5 8.5 12 12"/>',
  clipper: '<rect x="7" y="8" width="10" height="12" rx="2"/><path d="M7 8V6l2-2h6l2 2v2M9 4v2M12 4v2M15 4v2"/>',
  comb: '<path d="M5 4h14v4H5zM7 8v12M10 8v8M13 8v12M16 8v8M19 8v12"/>',
  dye: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  pet: '<circle cx="12" cy="13" r="6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="4.5" cy="11.5" r="1.6"/><circle cx="19.5" cy="11.5" r="1.6"/>',
  export: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  import: '<path d="M12 15V3m0 0 4 4m-4-4L8 7M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13h8l1-13"/>',
  undo: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/>',
  save: '<path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/>',
};

export const slider = (
  label: string, min: number, max: number, step: number, value: number,
  onInput: (v: number) => void, fmt: (v: number) => string = (v) => v.toFixed(1),
): HTMLElement => {
  const val = h("span", { className: "val" }, fmt(value));
  const input = h("input", { type: "range", min: String(min), max: String(max), step: String(step), value: String(value) }) as HTMLInputElement;
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    val.textContent = fmt(v);
    onInput(v);
  });
  return h("div", { className: "field" }, h("label", {}, document.createTextNode(label), val), input);
};

export const button = (label: string, cls: string, onClick: () => void): HTMLButtonElement => {
  const b = h("button", { className: `btn ${cls}`, type: "button" }, label) as HTMLButtonElement;
  b.addEventListener("click", onClick);
  return b;
};

export const toast = (msg: string) => {
  const el = h("div", { className: "toast" }, msg);
  document.body.append(el);
  setTimeout(() => el.remove(), 2200);
};

export const section = (title: string, ...children: HTMLElement[]): HTMLElement =>
  h("div", { className: "section" }, h("div", { className: "section-title" }, title), ...children);

export const rgbToHex = (c: number[]): string =>
  "#" + c.map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0")).join("");

export const hexToRgbArr = (hex: string): number[] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
