// Caption lettering in Anton: gradient fill, a hard dark outline and a
// white keyline, with a letterspaced tagline under (or over) the title.
const STYLE_GRADIENTS = {
  sunset: ['#ffe259', '#ff7518', '#ff2d95'],
  neon: ['#7df9ff', '#40e0ff', '#ff2d95'],
  classic: ['#ffffff', '#f4f1e8', '#cfc7ae'],
};
export function fitFontSize(ctx, text, maxWidth, base) {
  let size = base;
  ctx.font = `${size}px Anton, sans-serif`;
  const width = ctx.measureText(text).width;
  if (width > maxWidth) size = Math.floor(base * (maxWidth / width));
  return Math.max(24, size);
}
export function drawCaption(ctx, w, h, state) {
  const caption = (state.caption || 'AZUL HEAT').toUpperCase();
  const tagline = (state.tagline || '').toUpperCase();
  const atTop = state.captionPos === 'top';
  const base = Math.min(w, h) * 0.19 * state.captionScale;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${Math.round(base * 0.04)}px`; } catch { /* older canvas */ }
  const size = fitFontSize(ctx, caption, w * 0.92, base);
  ctx.font = `${size}px Anton, sans-serif`;
  const cx = w / 2;
  const cy = atTop ? size * 0.72 : h - size * 0.78;
  const grad = ctx.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
  const stops = STYLE_GRADIENTS[state.captionStyle] || STYLE_GRADIENTS.sunset;
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
  ctx.lineJoin = 'round';
  // Hard drop shadow first, so the lettering lifts off busy panels.
  ctx.fillStyle = 'rgba(10,3,24,0.55)';
  ctx.fillText(caption, cx + size * 0.045, cy + size * 0.055);
  ctx.strokeStyle = '#160a2e';
  ctx.lineWidth = size * 0.16;
  ctx.strokeText(caption, cx, cy);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.045;
  ctx.strokeText(caption, cx, cy);
  ctx.fillStyle = grad;
  ctx.fillText(caption, cx, cy);
  if (tagline) {
    const tSize = Math.max(16, size * 0.24);
    ctx.font = `${tSize}px Anton, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(tSize * 0.55)}px`; } catch { /* older canvas */ }
    const ty = atTop ? cy + size * 0.72 : cy - size * 0.74;
    ctx.lineWidth = tSize * 0.18;
    ctx.strokeStyle = '#160a2e';
    ctx.strokeText(tagline, cx, ty);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagline, cx, ty);
  }
  ctx.restore();
}
