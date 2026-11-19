// main.js — the Azul Cover Lab editor.
//
// Boots in one of two shapes: a ?shot= cover mode (shots.js takes the page)
// or the full editor. The editor keeps one state object (state.js), draws
// the live preview with render.js, and wires every control to it: photo tray
// with a brush, per-panel photo selects, click/drag/wheel on the canvas to
// select and frame a panel, caption and grade controls, and PNG exports at
// the three post sizes via exporter.js.

import { createState, ensurePanels, SIZES } from './state.js';
import { LAYOUTS, pointInPolygon } from './layouts.js';
import { loadSamples, filesToPhotos } from './photos.js';
import { drawCover } from './render.js';
import { exportPNG, installLab } from './exporter.js';
import { initShotMode } from './shots.js';

const $ = (id) => document.getElementById(id);

async function bootEditor() {
  const state = createState();
  installLab(state);

  const canvas = $('stage');
  const ctx = canvas.getContext('2d');
  let queued = false;
  const render = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      drawCover(ctx, canvas.width, canvas.height, state);
    });
  };

  const setCanvasForSize = () => {
    const { w, h } = SIZES[state.sizeKey];
    canvas.width = 1120;
    canvas.height = Math.round((1120 * h) / w);
    render();
  };

  // ---- photos -------------------------------------------------------------
  const tray = $('tray');
  const paintTray = () => {
    tray.replaceChildren();
    state.photos.forEach((photo, i) => {
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.name;
      img.title = photo.name;
      if (i === state.brush) img.classList.add('brush');
      img.addEventListener('click', () => {
        state.brush = i;
        state.panelPhoto[state.selected] = i;
        paintTray();
        paintPanelRows();
        render();
      });
      tray.appendChild(img);
    });
  };

  $('fileInput').addEventListener('change', async (e) => {
    const added = await filesToPhotos([...e.target.files]);
    if (added.length) {
      const first = state.photos.length;
      state.photos.push(...added);
      state.brush = first;
      state.panelPhoto[state.selected] = first;
      ensurePanels(state, LAYOUTS[state.layout].length);
      paintTray();
      paintPanelRows();
      render();
    }
    e.target.value = '';
  });

  // Drag & drop photos anywhere on the stage.
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', async (e) => {
    e.preventDefault();
    const added = await filesToPhotos([...e.dataTransfer.files]);
    if (added.length) {
      state.photos.push(...added);
      ensurePanels(state, LAYOUTS[state.layout].length);
      paintTray();
      paintPanelRows();
      render();
    }
  });

  // ---- panels ---------------------------------------------------------------
  const rows = $('panelRows');
  const paintPanelRows = () => {
    rows.replaceChildren();
    LAYOUTS[state.layout].forEach((_, i) => {
      const row = document.createElement('div');
      row.className = 'panel-row' + (i === state.selected ? ' sel' : '');
      const name = document.createElement('span');
      name.className = 'pname';
      name.textContent = `Panel ${i + 1}`;
      name.addEventListener('click', () => selectPanel(i));
      const sel = document.createElement('select');
      state.photos.forEach((photo, pi) => {
        const opt = document.createElement('option');
        opt.value = String(pi);
        opt.textContent = photo.name;
        sel.appendChild(opt);
      });
      sel.value = String(state.panelPhoto[i] ?? 0);
      sel.addEventListener('change', () => {
        state.panelPhoto[i] = Number(sel.value);
        render();
      });
      row.append(name, sel);
      rows.appendChild(row);
    });
    syncViewSliders();
  };

  const syncViewSliders = () => {
    const v = state.panelView[state.selected];
    $('zoomR').value = String(Math.round((v?.zoom ?? 1) * 100));
    $('xR').value = String(Math.round((v?.x ?? 0) * 100));
    $('yR').value = String(Math.round((v?.y ?? 0) * 100));
  };

  const selectPanel = (i) => {
    state.selected = i;
    paintPanelRows();
  };

  $('layoutSel').addEventListener('change', (e) => {
    state.layout = e.target.value;
    ensurePanels(state, LAYOUTS[state.layout].length);
    paintPanelRows();
    render();
  });
  $('sizeSel').addEventListener('change', (e) => {
    state.sizeKey = e.target.value;
    setCanvasForSize();
  });

  $('zoomR').addEventListener('input', (e) => {
    state.panelView[state.selected].zoom = Number(e.target.value) / 100;
    render();
  });
  $('xR').addEventListener('input', (e) => {
    state.panelView[state.selected].x = Number(e.target.value) / 100;
    render();
  });
  $('yR').addEventListener('input', (e) => {
    state.panelView[state.selected].y = Number(e.target.value) / 100;
    render();
  });

  // Pointer work on the canvas: click selects a panel, drag reframes its
  // photo, wheel zooms it.
  const unitPos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const p = unitPos(e);
    const polys = LAYOUTS[state.layout];
    for (let i = polys.length - 1; i >= 0; i--) {
      if (pointInPolygon(p.x, p.y, polys[i])) {
        selectPanel(i);
        drag = { x: e.clientX, y: e.clientY };
        canvas.setPointerCapture(e.pointerId);
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = canvas.getBoundingClientRect();
    const v = state.panelView[state.selected];
    v.x += (e.clientX - drag.x) / r.width;
    v.y += (e.clientY - drag.y) / r.height;
    drag = { x: e.clientX, y: e.clientY };
    syncViewSliders();
    render();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const v = state.panelView[state.selected];
    v.zoom = Math.min(3, Math.max(1, v.zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
    syncViewSliders();
    render();
  }, { passive: false });

  // ---- caption & grade -------------------------------------------------------
  $('capText').addEventListener('input', (e) => { state.caption = e.target.value; render(); });
  $('tagText').addEventListener('input', (e) => { state.tagline = e.target.value; render(); });
  $('capStyle').addEventListener('change', (e) => { state.captionStyle = e.target.value; render(); });
  $('capPos').addEventListener('change', (e) => { state.captionPos = e.target.value; render(); });
  $('capScale').addEventListener('input', (e) => { state.captionScale = Number(e.target.value) / 100; render(); });
  $('satR').addEventListener('input', (e) => { state.grade.sat = Number(e.target.value); render(); });
  $('conR').addEventListener('input', (e) => { state.grade.con = Number(e.target.value); render(); });
  $('warmR').addEventListener('input', (e) => { state.grade.warm = Number(e.target.value); render(); });

  // ---- export ------------------------------------------------------------------
  $('expSquare').addEventListener('click', () => exportPNG(state, 'square'));
  $('expPortrait').addEventListener('click', () => exportPNG(state, 'portrait'));
  $('expWide').addEventListener('click', () => exportPNG(state, 'wide'));

  // ---- go ------------------------------------------------------------------------
  state.photos = await loadSamples();
  ensurePanels(state, LAYOUTS[state.layout].length);
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
  } catch { /* fallback stack still draws */ }
  paintTray();
  paintPanelRows();
  setCanvasForSize();
}

const shotTaken = await initShotMode();
if (!shotTaken) await bootEditor();
