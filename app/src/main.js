// Azul Cover Lab editor: wires the controls to the state, keeps a live
// canvas preview, lets a visitor click a panel, drag its photo, zoom with
// the wheel, paint a thumbnail brush onto panels, and export in one click.
import { createState, ASPECTS, clampPanel } from './state.js';
import { getLayout, scalePoly, pointInPoly, LAYOUT_LABELS, panelCount } from './layouts.js';
import { loadSamples, addPhotoFiles, SAMPLES } from './photos.js';
import { drawCover } from './render.js';
import { downloadPNG } from './exporter.js';
import { parseShot, applyShotScene, exposeShotApi } from './shots.js';

const state = createState();
const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const ctx = canvas.getContext('2d');

export function previewSize() {
  const size = ASPECTS[state.aspect];
  const maxW = 920;
  const scale = Math.min(1, maxW / size.w);
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}
export function redraw() {
  const { w, h } = previewSize();
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  drawCover(ctx, w, h, { ...state, __editor: true });
  syncPanelControls();
}
function syncPanelControls() {
  const panel = state.panels[state.selectedPanel];
  if (!panel) return;
  $('zoom').value = panel.zoom;
  $('offx').value = panel.ox;
  $('offy').value = panel.oy;
  $('panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${panelCount(state.layout)}`;
  const sel = $('panelPhoto');
  sel.innerHTML = '';
  state.photos.forEach((p) => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = p.name;
    if (p.id === panel.photoId) o.selected = true;
    sel.appendChild(o);
  });
  document.querySelectorAll('.thumb').forEach((el, i) => {
    el.classList.toggle('brush', state.photos[i] && state.brushPhotoId === state.photos[i].id);
  });
  document.querySelectorAll('[data-layout]').forEach((el) => el.classList.toggle('on', el.dataset.layout === state.layout));
  document.querySelectorAll('[data-aspect]').forEach((el) => el.classList.toggle('on', el.dataset.aspect === state.aspect));
}
function buildThumbs() {
  const wrap = $('thumbs');
  wrap.innerHTML = '';
  state.photos.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'thumb'; b.type = 'button'; b.title = p.name;
    const img = document.createElement('img');
    img.src = p.img.src; img.alt = p.name;
    b.appendChild(img);
    b.addEventListener('click', () => { state.brushPhotoId = p.id; redraw(); });
    wrap.appendChild(b);
  });
}
function bindControls() {
  $('fileInput').addEventListener('change', (e) => addPhotoFiles(state, e.target.files, () => { buildThumbs(); redraw(); }));
  const stage = $('stage');
  stage.addEventListener('dragover', (e) => { e.preventDefault(); stage.classList.add('drop'); });
  stage.addEventListener('dragleave', () => stage.classList.remove('drop'));
  stage.addEventListener('drop', (e) => {
    e.preventDefault(); stage.classList.remove('drop');
    addPhotoFiles(state, e.dataTransfer.files, () => { buildThumbs(); redraw(); });
  });
  document.querySelectorAll('[data-layout]').forEach((el) => el.addEventListener('click', () => { state.layout = el.dataset.layout; state.selectedPanel = 0; redraw(); }));
  document.querySelectorAll('[data-aspect]').forEach((el) => el.addEventListener('click', () => { state.aspect = el.dataset.aspect; redraw(); }));
  document.querySelectorAll('[data-export]').forEach((el) => el.addEventListener('click', () => downloadPNG(el.dataset.export, state)));
  $('caption').addEventListener('input', (e) => { state.caption = e.target.value; redraw(); });
  $('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
  $('capStyle').addEventListener('change', (e) => { state.captionStyle = e.target.value; redraw(); });
  $('capPos').addEventListener('change', (e) => { state.captionPos = e.target.value; redraw(); });
  $('capScale').addEventListener('input', (e) => { state.captionScale = Number(e.target.value); redraw(); });
  $('grade').addEventListener('input', (e) => { state.grade = Number(e.target.value); redraw(); });
  $('warmth').addEventListener('input', (e) => { state.warmth = Number(e.target.value); redraw(); });
  $('panelPhoto').addEventListener('change', (e) => { state.panels[state.selectedPanel].photoId = Number(e.target.value); redraw(); });
  $('zoom').addEventListener('input', (e) => { clampPanel(Object.assign(state.panels[state.selectedPanel], { zoom: Number(e.target.value) })); redraw(); });
  $('offx').addEventListener('input', (e) => { state.panels[state.selectedPanel].ox = Number(e.target.value); redraw(); });
  $('offy').addEventListener('input', (e) => { state.panels[state.selectedPanel].oy = Number(e.target.value); redraw(); });
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    const polys = getLayout(state.layout);
    for (let i = 0; i < polys.length; i++) {
      if (pointInPoly(x, y, scalePoly(polys[i], canvas.width, canvas.height))) {
        state.selectedPanel = i;
        if (state.brushPhotoId !== null) state.panels[i].photoId = state.brushPhotoId;
        drag = { x: e.clientX, y: e.clientY };
        break;
      }
    }
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const panel = state.panels[state.selectedPanel];
    panel.ox += (e.clientX - drag.x) / 320;
    panel.oy += (e.clientY - drag.y) / 320;
    clampPanel(panel);
    drag = { x: e.clientX, y: e.clientY };
    redraw();
  });
  window.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[state.selectedPanel];
    panel.zoom += e.deltaY < 0 ? 0.07 : -0.07;
    clampPanel(panel);
    redraw();
  }, { passive: false });
}
async function boot() {
  await document.fonts.load('80px Anton');
  await loadSamples(state);
  const shot = parseShot();
  if (shot) applyShotScene(state, shot);
  buildThumbs();
  bindControls();
  $('caption').value = state.caption;
  $('tagline').value = state.tagline;
  redraw();
  exposeShotApi(state);
  window.__coverReady = true;
}
boot();
export { state, SAMPLES, LAYOUT_LABELS };
