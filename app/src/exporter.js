// PNG export at the three post sizes, always through the same renderer
// the preview uses, so what a visitor sees is exactly what they download.
import { ASPECTS } from './state.js';
import { drawCover } from './render.js';

export function renderToCanvas(w, h, state) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  const clean = { ...state, __editor: false };
  drawCover(ctx, w, h, clean);
  return canvas;
}
export function exportDataURLFor(w, h, state) {
  return renderToCanvas(w, h, state).toDataURL('image/png');
}
export function downloadPNG(aspectKey, state) {
  const size = ASPECTS[aspectKey];
  if (!size) return;
  const canvas = renderToCanvas(size.w, size.h, state);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azul-cover-${aspectKey}-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}
