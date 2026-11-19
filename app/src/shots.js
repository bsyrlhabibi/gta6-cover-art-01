// Screenshot scenes for ?shot= : each scene configures the real editor
// state, and the harness exports through the app's own export path.
import { ASPECTS } from './state.js';
import { exportDataURLFor } from './exporter.js';

export function parseShot() {
  const q = new URLSearchParams(location.search);
  return q.get('shot');
}
export function applyShotScene(state, shot) {
  if (shot === 'wide') {
    state.layout = 'poster'; state.aspect = 'wide';
    state.caption = 'AZUL HEAT'; state.tagline = 'BAHÍA AZUL';
    state.captionStyle = 'sunset'; state.captionPos = 'bottom';
    state.panels.forEach((p, i) => { p.photoId = [1, 0, 2, 3][i]; p.zoom = 1.08; });
    // The convertible sits low in its frame: lift the hero crop to show it.
    state.panels[0].oy = -0.34;
  } else if (shot === 'square') {
    state.layout = 'slices'; state.aspect = 'square';
    state.caption = 'AZUL HEAT'; state.tagline = 'BAHÍA AZUL';
    state.captionStyle = 'neon'; state.captionPos = 'bottom';
    state.panels.forEach((p, i) => { p.photoId = [2, 1, 0, 3][i]; p.zoom = 1.05; });
  } else if (shot === 'portrait') {
    state.layout = 'triptych'; state.aspect = 'portrait';
    state.caption = 'AZUL HEAT'; state.tagline = 'BAHÍA AZUL';
    state.captionStyle = 'sunset'; state.captionPos = 'top';
    state.panels.forEach((p, i) => { p.photoId = [0, 2, 1, 3][i]; });
  } else if (shot === 'editor') {
    state.layout = 'poster'; state.aspect = 'wide';
    state.caption = 'AZUL HEAT'; state.tagline = 'BAHÍA AZUL';
  }
}
export function exposeShotApi(state) {
  const shot = parseShot();
  window.__coverLab = {
    exportDataURL() {
      const key = shot === 'square' ? 'square' : shot === 'portrait' ? 'portrait' : 'wide';
      const size = ASPECTS[key];
      const clean = { ...state, selectedPanel: -1 };
      return exportDataURLFor(size.w, size.h, clean);
    },
  };
}
