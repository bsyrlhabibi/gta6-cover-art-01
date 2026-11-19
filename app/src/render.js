// Cover renderer: clips each layout polygon, cover-fits its photo with a
// focal anchor near the top so faces survive crops, grades it, then adds
// white poster gutters, the finish pass and the caption.
import { getLayout, scalePoly, polyBBox, shrinkPoly } from './layouts.js';
import { gradeFilter, applyWash, applyFinish, applyGrain } from './grade.js';
import { drawCaption } from './caption.js';
import { photoForPanel } from './photos.js';

export function drawPanelPhoto(ctx, poly, panel, photo, state) {
  if (!photo) return;
  const bbox = polyBBox(poly);
  ctx.save();
  ctx.beginPath();
  poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.clip();
  ctx.filter = gradeFilter(state);
  const img = photo.img;
  const scale = Math.max(bbox.w / img.naturalWidth, bbox.h / img.naturalHeight) * panel.zoom;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  const focalY = 0.27;
  let dx = bbox.x + (bbox.w - dw) / 2 + panel.ox * bbox.w * 0.5;
  let dy = bbox.y + (bbox.h - dh) * focalY + panel.oy * bbox.h * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  applyWash(ctx, bbox, state.panels.indexOf(panel), state);
  ctx.restore();
}
export function drawCover(ctx, w, h, state) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  const polys = getLayout(state.layout);
  const gutter = Math.max(5, Math.min(w, h) * 0.011);
  polys.forEach((norm, i) => {
    const panel = state.panels[i % state.panels.length];
    const poly = shrinkPoly(scalePoly(norm, w, h), gutter);
    drawPanelPhoto(ctx, poly, panel, photoForPanel(state, panel), state);
    if (i === state.selectedPanel && state.__editor) {
      ctx.save();
      ctx.beginPath();
      poly.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.strokeStyle = '#ffd23f';
      ctx.lineWidth = Math.max(3, gutter * 0.7);
      ctx.stroke();
      ctx.restore();
    }
  });
  applyFinish(ctx, w, h, state);
  applyGrain(ctx, w, h);
  // A thin white frame closes the poster, matching the panel gutters.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(6, Math.min(w, h) * 0.014);
  ctx.strokeRect(0, 0, w, h);
  drawCaption(ctx, w, h, state);
  ctx.restore();
}
