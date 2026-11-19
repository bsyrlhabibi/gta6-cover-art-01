// exporter.js — turns the editor state into shareable PNG files.
//
// Every export renders fresh at the size's full resolution on an offscreen
// canvas (the preview canvas is only a scaled view), so the downloaded PNG
// is always exactly 1080×1080, 1080×1350 or 1920×1080. The same renderer is
// exposed as window.__coverLab so a screenshot driver can produce the exact
// export bytes and verify the sizes without clicking through the UI.

import { SIZES } from './state.js';
import { drawCover } from './render.js';

export function renderOffscreen(state, w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, state);
  return canvas;
}

export function exportPNG(state, sizeKey) {
  const size = SIZES[sizeKey];
  const canvas = renderOffscreen(state, size.w, size.h);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `azul-cover-${sizeKey}-${size.w}x${size.h}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

export function installLab(state) {
  window.__coverLab = {
    sizes: SIZES,
    exportDataURL(sizeKey) {
      const size = SIZES[sizeKey];
      return renderOffscreen(state, size.w, size.h).toDataURL('image/png');
    },
    renderSize(sizeKey) {
      const size = SIZES[sizeKey];
      return { w: size.w, h: size.h };
    },
  };
}
