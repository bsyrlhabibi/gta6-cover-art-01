// grade.js — the Vice-City colour grade of Azul Cover Lab.
//
// Three layers, applied by render.js in order: a CSS-style filter on the
// photo itself (saturation, contrast, a touch of brightness), a translucent
// sunset wash laid over each panel with alternating hue so neighbouring
// panels feel cut from the same evening, and a finishing pass of sun glow,
// vignette and print grain over the whole poster.

export function filterString(grade) {
  const sat = 1 + grade.sat / 100;
  const con = 1 + grade.con / 100;
  const bright = 1 + grade.warm / 500;
  return `saturate(${sat.toFixed(3)}) contrast(${con.toFixed(3)}) brightness(${bright.toFixed(3)})`;
}

// Diagonal wash over one panel's bounding box. Even panels lean amber, odd
// panels lean magenta, and the warmth slider sets how strong the wash is.
export function panelWash(ctx, bb, index, grade) {
  const warm = grade.warm / 100;
  if (warm <= 0.01) return;
  const g = ctx.createLinearGradient(bb.x, bb.y, bb.x + bb.w, bb.y + bb.h);
  if (index % 2 === 0) {
    g.addColorStop(0, `rgba(255, 138, 76, ${(0.28 * warm).toFixed(3)})`);
    g.addColorStop(1, `rgba(239, 62, 110, ${(0.20 * warm).toFixed(3)})`);
  } else {
    g.addColorStop(0, `rgba(255, 210, 106, ${(0.18 * warm).toFixed(3)})`);
    g.addColorStop(1, `rgba(120, 60, 200, ${(0.24 * warm).toFixed(3)})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(bb.x, bb.y, bb.w, bb.h);
}

// Deterministic grain: one shared noise tile, made once with a seeded PRNG
// so every render of the same cover is pixel-identical.
let grainTile = null;
function makeGrainTile() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  const data = g.createImageData(256, 256);
  let seed = 0xA2B4C6D8;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 96 + Math.floor(rnd() * 64);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  return c;
}

export function drawFinish(ctx, w, h, grade) {
  // Sun glow from the top-right corner.
  const glow = ctx.createRadialGradient(w * 0.82, h * 0.10, 0, w * 0.82, h * 0.10, Math.max(w, h) * 0.75);
  glow.addColorStop(0, `rgba(255, 190, 90, ${(0.20 + grade.warm / 400).toFixed(3)})`);
  glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Vignette to seat the caption and focus the centre.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.36, w / 2, h / 2, Math.max(w, h) * 0.78);
  vig.addColorStop(0, 'rgba(10, 4, 18, 0)');
  vig.addColorStop(1, 'rgba(10, 4, 18, 0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // Print grain.
  if (!grainTile) grainTile = makeGrainTile();
  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(grainTile, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
