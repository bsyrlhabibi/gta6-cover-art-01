// state.js — the editor's single source of truth for Azul Cover Lab.
//
// Everything the renderer needs lives in one plain object from createState():
// which layout and canvas size, which photo fills each panel, how each panel's
// photo is zoomed and shifted, the caption and tagline with their styling, and
// the colour grade. The UI mutates it; render.js only reads it.

export const SIZES = {
  square: { key: 'square', w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  portrait: { key: 'portrait', w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  wide: { key: 'wide', w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
};

export const LAYOUT_KEYS = ['poster', 'slices', 'triptych', 'duo'];
export const CAPTION_STYLES = ['sunset', 'neon', 'classic'];

export function freshView() {
  return { zoom: 1, x: 0, y: 0 };
}

export function createState() {
  return {
    layout: 'poster',
    sizeKey: 'wide',
    photos: [], // [{ id, name, url, img }] — filled by photos.js
    panelPhoto: [0, 1, 2, 3, 0, 1],
    panelView: [freshView(), freshView(), freshView(), freshView(), freshView(), freshView()],
    selected: 0,
    brush: 0,
    caption: 'AZUL HEAT',
    tagline: 'BAHÍA AZUL',
    captionStyle: 'sunset',
    captionPos: 'bottom',
    captionScale: 1,
    grade: { sat: 35, con: 12, warm: 30 },
  };
}

// Keep the per-panel arrays as long as the layout needs, preserving the
// choices already made and wrapping photo indices that went out of range.
export function ensurePanels(state, panelCount) {
  while (state.panelView.length < panelCount) state.panelView.push(freshView());
  while (state.panelPhoto.length < panelCount) {
    state.panelPhoto.push(state.panelPhoto.length % Math.max(1, state.photos.length));
  }
  const n = Math.max(1, state.photos.length);
  state.panelPhoto = state.panelPhoto.map((p) => ((p % n) + n) % n);
  if (state.selected >= panelCount) state.selected = 0;
}
