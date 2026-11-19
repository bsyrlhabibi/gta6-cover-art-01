// caption.js — the poster's lettering, set in Anton.
//
// The headline is drawn the way game covers print it: a hard dark outline
// (strokeText with round joins), a vertical gradient fill in one of three
// styles, and a letterspaced tagline under or over it. The headline shrinks
// to fit the poster's width, so a long caption never spills off the art.

const STYLE_STOPS = {
  sunset: ['#ffe27a', '#ff8a4c', '#ef3e6e'],
  neon: ['#a5f8ff', '#4cc9ff', '#ff71ce'],
  classic: ['#ffffff', '#d7dee8', '#9fb2c8'],
};

function gradientFor(ctx, style, y0, y1) {
  const stops = STYLE_STOPS[style] ?? STYLE_STOPS.sunset;
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((colour, i) => g.addColorStop(i / (stops.length - 1), colour));
  return g;
}

// Draw text centred at cx with its baseline at y, letterspaced by tracking
// (a fraction of the font size). Falls back to per-character drawing where
// the canvas has no letterSpacing property.
function spacedFillText(ctx, text, cx, y, tracking) {
  if ('letterSpacing' in ctx) {
    ctx.fillText(text, cx, y);
    return;
  }
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const gap = tracking;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (text.length - 1);
  let x = cx - total / 2;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + gap;
  });
  ctx.textAlign = prevAlign;
}

export function drawCaption(ctx, w, h, state) {
  const headline = (state.caption ?? '').trim();
  const tagline = (state.tagline ?? '').trim();
  if (!headline && !tagline) return;

  const bottom = state.captionPos !== 'top';
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Headline: size from the poster width, then shrink until it fits.
  let size = w * 0.118 * (state.captionScale || 1);
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  const maxWidth = w * 0.92;
  const measured = headline ? ctx.measureText(headline).width : 0;
  if (measured > maxWidth) {
    size *= maxWidth / measured;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }

  const baseY = bottom ? h * 0.888 : h * 0.155 + size * 0.72;
  if (headline) {
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(24, 6, 20, 0.95)';
    ctx.lineWidth = Math.max(2, size * 0.17);
    ctx.strokeText(headline, w / 2, baseY);
    ctx.fillStyle = gradientFor(ctx, state.captionStyle, baseY - size, baseY);
    ctx.fillText(headline, w / 2, baseY);
  }

  // Tagline: small, letterspaced, in the poster's cream.
  if (tagline) {
    const tagSize = Math.max(11, size * 0.30);
    ctx.font = `${tagSize}px Anton, 'Arial Narrow', sans-serif`;
    const tagY = bottom ? baseY + tagSize * 1.30 : baseY - size * 0.98;
    ctx.fillStyle = 'rgba(250, 243, 230, 0.96)';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(tagSize * 0.55)}px`;
    spacedFillText(ctx, tagline, w / 2, tagY, tagSize * 0.55);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  ctx.restore();
}
