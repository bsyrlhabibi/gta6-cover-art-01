// Azul Cover Lab — central editor state. One plain object, no framework:
// every module reads it and the renderer draws exactly what it describes.
export function createPanel(photoId) {
  return { photoId, zoom: 1, ox: 0, oy: 0 };
}
export function createState() {
  return {
    caption: 'AZUL HEAT',
    tagline: 'BAHÍA AZUL',
    captionStyle: 'sunset',
    captionPos: 'bottom',
    captionScale: 1,
    layout: 'poster',
    aspect: 'wide',
    grade: 0.8,
    warmth: 0.6,
    selectedPanel: 0,
    brushPhotoId: null,
    photos: [],
    panels: [createPanel(0), createPanel(1), createPanel(2), createPanel(3)],
  };
}
export const ASPECTS = {
  square: { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
};
export function aspectClass(w, h) {
  const r = w / h;
  if (r > 1.25) return 'wide';
  if (r < 0.85) return 'portrait';
  return 'square';
}
export function clampPanel(panel) {
  panel.zoom = Math.min(3, Math.max(1, panel.zoom));
  panel.ox = Math.min(0.6, Math.max(-0.6, panel.ox));
  panel.oy = Math.min(0.6, Math.max(-0.6, panel.oy));
  return panel;
}
