// shots.js — the screenshot modes behind shots.json.
//
// With ?shot=wide|square|portrait the page becomes a single full-window
// canvas showing one finished cover at exactly the capture size, each mode
// with its own layout and caption style so the four screenshots show the
// app's range. ?shot=editor (or no parameter) boots the normal editor in
// main.js instead; initShotMode returns true when it has taken the page
// over, and the editor is never built.

import { createState, ensurePanels } from './state.js';
import { LAYOUTS } from './layouts.js';
import { loadSamples } from './photos.js';
import { drawCover } from './render.js';

const PRESETS = {
  wide: { layout: 'poster', captionStyle: 'sunset', caption: 'AZUL HEAT' },
  square: { layout: 'slices', captionStyle: 'neon', caption: 'AZUL HEAT' },
  portrait: { layout: 'triptych', captionStyle: 'sunset', caption: 'AZUL HEAT' },
};

// Per-mode framing tweaks: in the wide poster the hero panel's photo is the
// convertible scene, whose subject sits low in the frame, so its view is
// shifted down to keep the car inside the panel instead of cropping it out.
const PRESET_VIEWS = {
  wide: { 0: { zoom: 1, x: 0, y: -0.3 } },
};

// Per-mode panel photos where the default order fights the composition: in
// the wide poster the bottom strip carries the caption, and the pier scene's
// lifeguard tower lands right behind the tagline, so the strip reuses the
// boulevard scene (its sun sits behind the headline instead).
const PRESET_PHOTOS = {
  wide: [0, 1, 2, 1],
};

export async function initShotMode() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot || shot === 'editor' || !PRESETS[shot]) return false;

  const preset = PRESETS[shot];
  document.body.classList.add('shot');
  document.getElementById('editor').hidden = true;
  const wrap = document.getElementById('shotWrap');
  wrap.hidden = false;

  const state = createState();
  state.layout = preset.layout;
  state.captionStyle = preset.captionStyle;
  state.caption = preset.caption;
  state.photos = await loadSamples();
  ensurePanels(state, LAYOUTS[state.layout].length);
  for (const [index, view] of Object.entries(PRESET_VIEWS[shot] ?? {})) {
    state.panelView[Number(index)] = view;
  }
  if (PRESET_PHOTOS[shot]) state.panelPhoto = [...PRESET_PHOTOS[shot]];

  // The caption is set in Anton; wait for the face before drawing, or the
  // screenshot would fall back to a system sans.
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
  } catch {
    /* the fallback stack in caption.js still draws */
  }

  const canvas = document.getElementById('shotCanvas');
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  drawCover(canvas.getContext('2d'), canvas.width, canvas.height, state);
  document.title = `shot-ready-${shot}`;
  return true;
}
