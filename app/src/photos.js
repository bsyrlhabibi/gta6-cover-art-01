// Photo handling: bundled sample scenes plus the visitor's own files,
// read locally with FileReader / object URLs and never uploaded anywhere.
export const SAMPLES = [
  { src: 'samples/boulevard.jpg', name: 'Boulevard' },
  { src: 'samples/car.jpg', name: 'Convertible at sunset' },
  { src: 'samples/neon.jpg', name: 'Neon night street' },
  { src: 'samples/pier.jpg', name: 'Pier' },
];
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed: ' + src));
    img.src = src;
  });
}
export async function loadSamples(state) {
  for (let i = 0; i < SAMPLES.length; i++) {
    const img = await loadImage(SAMPLES[i].src);
    state.photos.push({ id: i, img, name: SAMPLES[i].name });
  }
  state.panels.forEach((p, i) => { p.photoId = i % state.photos.length; });
  return state.photos;
}
export async function addPhotoFiles(state, files, onDone) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      state.photos.push({ id: state.photos.length, img, name: file.name.slice(0, 24) });
    } catch { /* skip unreadable files */ }
  }
  if (onDone) onDone();
}
export function photoForPanel(state, panel) {
  if (!state.photos.length) return null;
  const found = state.photos.find((p) => p.id === panel.photoId);
  return found || state.photos[0];
}
