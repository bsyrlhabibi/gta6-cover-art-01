// layouts.js — the four panel tilings of Azul Cover Lab.
//
// Each layout is a list of polygons in unit space ([0,1] × [0,1]); the
// renderer scales them to whatever canvas size is exported, so one tiling
// serves the square, portrait and wide posters alike. Inside a layout every
// seam is shared: neighbouring polygons name the same seam points, so the
// white poster gutters the renderer strokes along the edges line up exactly
// and no sliver of background can show between panels.

export const LAYOUTS = {
  // One big hero panel, two stacked beside it, one wide along the bottom —
  // the classic cover composition. All four meet at the centre point b.
  poster: [
    [[0, 0], [0.55, 0], [0.47, 0.52], [0, 0.60]],
    [[0.55, 0], [1, 0], [1, 0.38], [0.47, 0.52]],
    [[0.47, 0.52], [1, 0.38], [1, 1], [0.60, 1]],
    [[0, 0.60], [0.47, 0.52], [0.60, 1], [0, 1]],
  ],
  // Four parallel diagonal bands, all seams running the same slant.
  slices: [
    [[0, 0], [0.30, 0], [0.02, 1], [0, 1]],
    [[0.30, 0], [0.58, 0], [0.30, 1], [0.02, 1]],
    [[0.58, 0], [0.86, 0], [0.58, 1], [0.30, 1]],
    [[0.86, 0], [1, 0], [1, 1], [0.58, 1]],
  ],
  // Three near-vertical columns with a slight slant, for portrait posters.
  triptych: [
    [[0, 0], [0.36, 0], [0.30, 1], [0, 1]],
    [[0.36, 0], [0.68, 0], [0.62, 1], [0.30, 1]],
    [[0.68, 0], [1, 0], [1, 1], [0.62, 1]],
  ],
  // Two big panels split by one long diagonal — room for two heroes.
  duo: [
    [[0, 0], [0.72, 0], [0.28, 1], [0, 1]],
    [[0.72, 0], [1, 0], [1, 1], [0.28, 1]],
  ],
};

export function panelCount(layoutKey) {
  return LAYOUTS[layoutKey].length;
}

// Axis-aligned bounding box of a unit-space polygon on a w × h canvas.
export function panelBBox(poly, w, h) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const [px, py] of poly) {
    if (px < x0) x0 = px;
    if (py < y0) y0 = py;
    if (px > x1) x1 = px;
    if (py > y1) y1 = py;
  }
  return { x: x0 * w, y: y0 * h, w: (x1 - x0) * w, h: (y1 - y0) * h };
}

// Trace a unit-space polygon onto a canvas context, scaled to w × h.
export function tracePolygon(ctx, poly, w, h) {
  ctx.beginPath();
  poly.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px * w, py * h);
    else ctx.lineTo(px * w, py * h);
  });
  ctx.closePath();
}

// Ray-casting hit test in unit space, for click-to-select in the editor.
export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}
