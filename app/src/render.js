// render.js — draws one complete Azul Cover Lab poster onto a canvas.
//
// Order matters and mirrors how a printed cover is built: each panel's photo
// is cover-fitted into the panel's bounding box (a focal anchor keeps faces
// near the top of the frame), clipped to the panel polygon and graded; then
// the white poster gutters are stroked along every seam; then the finishing
// pass (glow, vignette, grain); and the caption goes on last, over it all.

import { LAYOUTS, panelBBox, tracePolygon } from './layouts.js';
import { filterString, panelWash, drawFinish } from './grade.js';
import { drawCaption } from './caption.js';
import { freshView } from './state.js';

const PAPER = '#f7f1e5';
const BACKDROP = '#180a24';

function drawPanel(ctx, w, h, state, poly, index) {
  const photo = state.photos[state.panelPhoto[index] ?? 0];
  const bb = panelBBox(poly, w, h);
  ctx.save();
  tracePolygon(ctx, poly, w, h);
  ctx.clip();

  if (!photo || !photo.img) {
    // No photo yet: a dusk gradient placeholder in the panel's hue family.
    const g = ctx.createLinearGradient(bb.x, bb.y, bb.x, bb.y + bb.h);
    g.addColorStop(0, index % 2 ? '#5b2a6e' : '#8a2b4f');
    g.addColorStop(1, '#1d0f2a');
    ctx.fillStyle = g;
    ctx.fillRect(bb.x, bb.y, bb.w, bb.h);
    ctx.restore();
    return;
  }

  const img = photo.img;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const view = state.panelView[index] ?? freshView();

  // Cover-fit: scale so the photo covers the bounding box, then place it so
  // the focal point (horizontally centred, 27% down — where faces live) sits
  // a little above the box's middle, shifted by the panel's own view. The
  // result is clamped so the photo can never uncover a corner of the box.
  const scale = Math.max(bb.w / iw, bb.h / ih) * (view.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  let dx = bb.x + bb.w * (0.5 + (view.x || 0)) - dw * 0.5;
  let dy = bb.y + bb.h * (0.40 + (view.y || 0)) - dh * 0.27;
  dx = Math.min(bb.x, Math.max(bb.x + bb.w - dw, dx));
  dy = Math.min(bb.y, Math.max(bb.y + bb.h - dh, dy));

  ctx.filter = filterString(state.grade);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';

  panelWash(ctx, bb, index, state.grade);
  ctx.restore();
}

export function drawCover(ctx, w, h, state) {
  ctx.save();
  ctx.fillStyle = BACKDROP;
  ctx.fillRect(0, 0, w, h);

  const polys = LAYOUTS[state.layout];
  polys.forEach((poly, i) => drawPanel(ctx, w, h, state, poly, i));

  // White poster gutters on every seam, plus the outer frame.
  ctx.lineJoin = 'round';
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = Math.max(3, w * 0.0068);
  polys.forEach((poly) => {
    tracePolygon(ctx, poly, w, h);
    ctx.stroke();
  });
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);

  drawFinish(ctx, w, h, state.grade);
  drawCaption(ctx, w, h, state);
  ctx.restore();
}
