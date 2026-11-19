// Colour grade: a canvas filter for saturation/contrast plus a per-panel
// sunset or neon gradient wash, a warm sun glow and a soft vignette.
export function gradeFilter(state) {
  const sat = 1 + state.grade * 0.55;
  const con = 1 + state.grade * 0.18;
  const warm = 1 + state.warmth * 0.06;
  return `saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) sepia(${(state.warmth * 0.18).toFixed(3)}) brightness(${warm.toFixed(3)})`;
}
const WASHES = [
  ['rgba(255,94,58,0.34)', 'rgba(255,176,66,0.05)'],
  ['rgba(255,45,149,0.30)', 'rgba(64,224,255,0.06)'],
  ['rgba(64,224,255,0.26)', 'rgba(255,94,58,0.05)'],
  ['rgba(146,64,255,0.28)', 'rgba(255,176,66,0.07)'],
];
export function applyWash(ctx, bbox, panelIndex, state) {
  const [top, bottom] = WASHES[panelIndex % WASHES.length];
  const g = ctx.createLinearGradient(0, bbox.y, 0, bbox.y + bbox.h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, state.grade));
  ctx.fillStyle = g;
  ctx.fillRect(bbox.x, bbox.y, bbox.w, bbox.h);
  ctx.restore();
}
export function applyFinish(ctx, w, h, state) {
  const glowX = w * 0.78, glowY = h * 0.16;
  const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(w, h) * 0.55);
  glow.addColorStop(0, `rgba(255,190,80,${0.20 * state.warmth + 0.06})`);
  glow.addColorStop(1, 'rgba(255,190,80,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(10,4,24,0)');
  vig.addColorStop(1, 'rgba(10,4,24,0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
export function applyGrain(ctx, w, h) {
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  ctx.save();
  for (let i = 0; i < 2600; i++) {
    const a = rnd() * 0.07;
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
  ctx.restore();
}
