// Panel layouts: polygon tilings that partition the cover rectangle with
// shared seam points, so neighbouring panels meet exactly and the white
// poster gutter drawn on each seam lines up on both sides.
const POSTER = [
  [[0, 0], [1, 0], [1, 0.52], [0, 0.62]],
  [[0, 0.62], [0.34, 0.595], [0.33, 1], [0, 1]],
  [[0.34, 0.595], [0.67, 0.55], [0.67, 1], [0.33, 1]],
  [[0.67, 0.55], [1, 0.52], [1, 1], [0.67, 1]],
];
const SLICES = [
  [[0, 0], [0.28, 0], [0.20, 1], [0, 1]],
  [[0.28, 0], [0.52, 0], [0.44, 1], [0.20, 1]],
  [[0.52, 0], [0.76, 0], [0.68, 1], [0.44, 1]],
  [[0.76, 0], [1, 0], [1, 1], [0.68, 1]],
];
const TRIPTYCH = [
  [[0, 0], [0.36, 0], [0.30, 1], [0, 1]],
  [[0.36, 0], [0.68, 0], [0.64, 1], [0.30, 1]],
  [[0.68, 0], [1, 0], [1, 1], [0.64, 1]],
];
const DUO = [
  [[0, 0], [0.58, 0], [0.42, 1], [0, 1]],
  [[0.58, 0], [1, 0], [1, 1], [0.42, 1]],
];
const BY_NAME = { poster: POSTER, slices: SLICES, triptych: TRIPTYCH, duo: DUO };
export const LAYOUT_LABELS = { poster: 'Poster hero', slices: 'Slices', triptych: 'Triptych', duo: 'Duo' };
export function getLayout(name) {
  return BY_NAME[name] || POSTER;
}
export function panelCount(name) {
  return getLayout(name).length;
}
export function scalePoly(poly, w, h) {
  return poly.map(([x, y]) => [x * w, y * h]);
}
export function polyBBox(poly) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
export function polyCentroid(poly) {
  let x = 0, y = 0;
  for (const p of poly) { x += p[0]; y += p[1]; }
  return [x / poly.length, y / poly.length];
}
export function shrinkPoly(poly, px) {
  const [cx, cy] = polyCentroid(poly);
  return poly.map(([x, y]) => {
    const dx = x - cx, dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    const s = Math.max(0, d - px) / d;
    return [cx + dx * s, cy + dy * s];
  });
}
export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
