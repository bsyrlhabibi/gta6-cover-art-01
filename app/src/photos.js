// photos.js — where cover photos come from.
//
// Two sources, both fully offline: the four bundled Bahía Azul sample scenes
// under app/samples/, and the visitor's own files, read with FileReader as
// data URLs on their own machine. Nothing is ever uploaded anywhere; a photo
// exists only as an Image element in this page's memory.

export const SAMPLES = [
  { file: 'samples/car.jpg', name: 'Convertible at sunset' },
  { file: 'samples/boulevard.jpg', name: 'Sunset boulevard' },
  { file: 'samples/neon.jpg', name: 'Neon night street' },
  { file: 'samples/pier.jpg', name: 'Pier at dusk' },
];

let nextId = 1;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

export async function loadSamples() {
  const photos = [];
  for (const s of SAMPLES) {
    const img = await loadImage(s.file);
    photos.push({ id: nextId++, name: s.name, url: s.file, img });
  }
  return photos;
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function filesToPhotos(files) {
  const photos = [];
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const url = await readFileAsDataURL(file);
    const img = await loadImage(url);
    photos.push({ id: nextId++, name: file.name.replace(/\.[^.]+$/, ''), url, img });
  }
  return photos;
}
