/**
 * ui-frames.js — Procedural UI chrome for AshLane menus.
 *
 * The owner said menus "look like real bullshit" — plain boxes with no art.
 * These generators make street-themed frames, dividers, and ornaments as
 * SVG so every menu can have custom art without image files.
 *
 * Styles: spray border, caution tape, chain, torn paper, riveted metal.
 */
import { rng, esc } from "./rng.js";

const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

function roughRectPath(R, x, y, w, h, roughness) {
  // jittered rectangle path for hand-sprayed feel
  const j = () => R.range(-roughness, roughness);
  const p = [
    [x + j(), y + j()], [x + w + j(), y + j()],
    [x + w + j(), y + h + j()], [x + j(), y + h + j()],
  ];
  return `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} L ${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)} L ${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)} L ${p[3][0].toFixed(1)} ${p[3][1].toFixed(1)} Z`;
}

/**
 * Spray-paint frame — rough double border with overspray dots.
 * Returns SVG sized w x h; content goes inside with ~pad inset.
 */
export function sprayFrame({ w = 400, h = 200, seed = 1, color = "#e33d2e", bg = "#141414", pad = 18 } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let dots = "";
  for (let i = 0; i < 40; i++) {
    // overspray clustered near edges
    const edge = R.int(0, 3);
    let x, y;
    if (edge === 0) { x = R.range(0, w); y = R.range(0, pad + 8); }
    else if (edge === 1) { x = R.range(0, w); y = R.range(h - pad - 8, h); }
    else if (edge === 2) { x = R.range(0, pad + 8); y = R.range(0, h); }
    else { x = R.range(w - pad - 8, w); y = R.range(0, h); }
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${R.range(0.8, 3).toFixed(1)}" fill="${color}" opacity="${R.range(0.3, 0.8).toFixed(2)}"/>`;
  }
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="spray${fSeed}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${fSeed}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="6"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}" opacity="0.92"/>
  <path d="${roughRectPath(R, pad, pad, w - pad * 2, h - pad * 2, 3)}" fill="none" stroke="${color}" stroke-width="5" filter="url(#spray${fSeed})" opacity="0.9"/>
  <path d="${roughRectPath(R, pad + 9, pad + 9, w - (pad + 9) * 2, h - (pad + 9) * 2, 2)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.55"/>
  ${dots}
</svg>`;
}

/**
 * Caution-tape divider — diagonal striped bar with torn ends.
 */
export function cautionDivider({ w = 600, h = 36, seed = 2, text = "" } = {}) {
  const R = rng(seed);
  const stripeW = 28;
  let stripes = "";
  for (let x = -h; x < w + h; x += stripeW) {
    stripes += `<polygon points="${x},0 ${x + stripeW / 2},0 ${x + stripeW / 2 - h},${h} ${x - h},${h}" fill="#f5c518"/>`;
  }
  // torn ends via jittered clip
  const tear = (x0, dir) => {
    let d = `M ${x0} 0`;
    let y = 0;
    while (y < h) { y += R.range(4, 10); d += ` L ${(x0 + dir * R.range(0, 14)).toFixed(1)} ${Math.min(y, h).toFixed(1)}`; }
    return d + ` L ${x0} ${h} Z`;
  };
  const label = text
    ? `<text x="${w / 2}" y="${h / 2 + 6}" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="18" font-weight="900" fill="#111" letter-spacing="4">${esc(text)}</text>`
    : "";
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#161616"/>
  ${stripes}
  <rect width="${w}" height="${h}" fill="#000" opacity="0.18"/>
  <path d="${tear(0, 1)}" fill="#161616"/>
  <path d="${tear(w, -1)}" fill="#161616"/>
  ${label}
</svg>`;
}

/**
 * Chain divider — horizontal chain links.
 */
export function chainDivider({ w = 600, h = 28, seed = 3, color = "#8a8f96" } = {}) {
  const R = rng(seed);
  const linkW = 26, linkH = 18;
  let links = "";
  for (let x = 4; x < w - linkW; x += linkW * 0.72) {
    const y = (h - linkH) / 2;
    links += `<ellipse cx="${(x + linkW / 2).toFixed(1)}" cy="${(h / 2).toFixed(1)}" rx="${(linkW / 2).toFixed(1)}" ry="${(linkH / 2).toFixed(1)}" fill="none" stroke="${color}" stroke-width="4.5"/>`;
    links += `<ellipse cx="${(x + linkW / 2).toFixed(1)}" cy="${(h / 2).toFixed(1)}" rx="${(linkW / 2).toFixed(1)}" ry="${(linkH / 2).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.35" transform="translate(-1.5,-1.5)"/>`;
  }
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${links}</svg>`;
}

/**
 * Riveted metal panel — dark plate with corner rivets + scratches.
 * Good for: menu backgrounds, HUD panels.
 */
export function metalPanel({ w = 400, h = 200, seed = 4, base = "#23262b" } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let scratches = "";
  for (let i = 0; i < 14; i++) {
    const x = R.range(0, w), y = R.range(0, h);
    scratches += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + R.range(-60, 60)).toFixed(1)}" y2="${(y + R.range(-20, 20)).toFixed(1)}" stroke="#ffffff" stroke-width="${R.range(0.5, 1.2).toFixed(1)}" opacity="${R.range(0.05, 0.14).toFixed(2)}"/>`;
  }
  const rivet = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="7" fill="#3a3e44"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="2.4" fill="#cfd4da" opacity="0.8"/>`;
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="mp${fSeed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${base}"/>
  <rect width="${w}" height="${h}" fill="url(#mp${fSeed})"/>
  ${scratches}
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="#000" stroke-width="2" opacity="0.6"/>
  ${rivet(20, 20)}${rivet(w - 20, 20)}${rivet(20, h - 20)}${rivet(w - 20, h - 20)}
</svg>`;
}

/**
 * Torn-paper banner — jagged top/bottom edges, for titles.
 */
export function tornBanner({ w = 600, h = 90, seed = 5, fill = "#e33d2e", text = "", textColor = "#fff" } = {}) {
  const R = rng(seed);
  const edge = (yBase, flip) => {
    let d = `M 0 ${flip ? h : 0}`;
    for (let x = 0; x <= w; x += R.range(14, 34)) {
      d += ` L ${x.toFixed(1)} ${(yBase + R.range(-7, 7) * (flip ? -1 : 1)).toFixed(1)}`;
    }
    return d + ` L ${w} ${flip ? h : 0} Z`;
  };
  const label = text
    ? `<text x="${w / 2}" y="${h / 2 + 14}" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="40" font-weight="900" fill="${textColor}" letter-spacing="3">${esc(text)}</text>`
    : "";
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <path d="${edge(6, false)}" fill="${fill}" opacity="0.35"/>
  <path d="${edge(h - 6, true)}" fill="#000" opacity="0.3"/>
  <rect x="0" y="6" width="${w}" height="${h - 12}" fill="${fill}"/>
  <rect x="0" y="6" width="${w}" height="5" fill="#fff" opacity="0.18"/>
  ${label}
</svg>`;
}

/**
 * Corner brackets — HUD-style targeting corners.
 */
export function cornerBrackets({ w = 200, h = 200, color = "#f5c518", thick = 6, len = 42 } = {}) {
  const c = (x, y, sx, sy) =>
    `<path d="M ${x + sx * len} ${y} L ${x} ${y} L ${x} ${y + sy * len}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="square"/>`;
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${c(8, 8, 1, 1)}${c(w - 8, 8, -1, 1)}${c(8, h - 8, 1, -1)}${c(w - 8, h - 8, -1, -1)}
</svg>`;
}

export const FRAMES = { sprayFrame, cautionDivider, chainDivider, metalPanel, tornBanner, cornerBrackets };
