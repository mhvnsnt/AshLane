/**
 * graffiti.js — Procedural graffiti tag generator for AshLane.
 *
 * Generates street-style tags as SVG: layered text with outline, fill,
 * highlight, drips, and overspray splatter. Seeded = reproducible.
 *
 * Technique notes (adapted from the spray-paint SVG approach):
 * - Use heavy display fonts available on device (system fallback stack).
 * - Outline layer behind fill, offset highlight, drip paths below letters.
 * - Overspray = low-opacity blurred circles around the tag.
 *
 * Usage:
 *   import { tag, throwup, piece } from './graffiti.js';
 *   fs.writeFileSync('tag.svg', tag('ASHLANE', { seed: 42 }));
 */
import { rng, esc } from "./rng.js";

const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

// Heavy display font stack — works without webfont downloads.
const DISPLAY_FONT = `'Arial Black','Archivo Black','Anton',Impact,sans-serif`;
const SCRIPT_FONT = `'Brush Script MT','Segoe Script',cursive`;

const PALETTES = [
  { fill: "#e33d2e", outline: "#111111", hi: "#ff8a7a", name: "red" },
  { fill: "#2e9be3", outline: "#0d1b2a", hi: "#9adcff", name: "blue" },
  { fill: "#f5c518", outline: "#1a1a1a", hi: "#ffe98a", name: "gold" },
  { fill: "#7de32e", outline: "#0f2408", hi: "#c6ff9a", name: "lime" },
  { fill: "#b44be3", outline: "#1c0f24", hi: "#e3a9ff", name: "purple" },
  { fill: "#e3e3e3", outline: "#222222", hi: "#ffffff", name: "silver" },
  { fill: "#ff6b1a", outline: "#2a1000", hi: "#ffb37a", name: "orange" },
];

function splatter(R, w, h, color, n, maxR) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = R.range(-20, w + 20), y = R.range(-20, h + 20);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${R.range(1, maxR).toFixed(1)}" fill="${color}" opacity="${R.range(0.25, 0.7).toFixed(2)}"/>`;
  }
  return s;
}

function drips(R, x, yTop, count, color) {
  let d = "";
  for (let i = 0; i < count; i++) {
    const dx = x + R.range(-40, 40);
    const len = R.range(8, 60);
    const wob = R.range(-6, 6);
    d += `<path d="M ${dx.toFixed(1)} ${yTop} q ${wob.toFixed(1)} ${(len / 2).toFixed(1)} 0 ${len.toFixed(1)}" stroke="${color}" stroke-width="${R.range(2, 5).toFixed(1)}" stroke-linecap="round" fill="none" opacity="0.85"/>`;
    d += `<circle cx="${dx.toFixed(1)}" cy="${(yTop + len).toFixed(1)}" r="${R.range(1.5, 3.5).toFixed(1)}" fill="${color}" opacity="0.85"/>`;
  }
  return d;
}

function tagSvg({ text, w, h, palette, R, fontSize, font, rotate, dripCount, splatterN }) {
  const cx = w / 2, cy = h / 2;
  const rot = rotate ? `rotate(${R.range(-6, 6).toFixed(1)} ${cx} ${cy})` : "";
  const dy = fontSize * 0.35;
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>
  <g ${rot ? `transform="${rot}"` : ""}>
    ${splatter(R, w, h, palette.fill, Math.floor(splatterN / 2), 9)}
    <g filter="url(#soft)" opacity="0.5">
      <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="900" fill="${palette.fill}">${esc(text)}</text>
    </g>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="900" fill="none" stroke="${palette.outline}" stroke-width="${(fontSize * 0.14).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${esc(text)}</text>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="900" fill="${palette.fill}">${esc(text)}</text>
    <text x="${cx - fontSize * 0.02}" y="${cy + dy - fontSize * 0.22}" text-anchor="middle" font-family="${font}" font-size="${fontSize}" font-weight="900" fill="${palette.hi}" opacity="0.55">${esc(text)}</text>
    ${drips(R, cx, cy + dy + fontSize * 0.3, dripCount, palette.fill)}
    ${splatter(R, w, h, palette.fill, splatterN, 4)}
  </g>
</svg>`;
}

/**
 * Quick street tag — one word, spray style.
 * @param {string} text tag text
 */
export function tag(text, { seed = 1, w = 600, h = 220, palette = null, rotate = true } = {}) {
  const R = rng(seed);
  const p = palette || R.pick(PALETTES);
  const fontSize = Math.min(h * 0.62, (w / Math.max(text.length, 1)) * 1.15);
  return tagSvg({ text, w, h, palette: p, R, fontSize, font: DISPLAY_FONT, rotate, dripCount: R.int(3, 8), splatterN: 26 });
}

/**
 * Throw-up — bubblier, two-tone, heavier outline. Classic quick piece.
 */
export function throwup(text, { seed = 2, w = 700, h = 260, palette = null } = {}) {
  const R = rng(seed);
  const p = palette || R.pick(PALETTES);
  const inner = R.pick(PALETTES.filter((q) => q.name !== p.name));
  const fontSize = Math.min(h * 0.6, (w / Math.max(text.length, 1)) * 1.25);
  const cx = w / 2, cy = h / 2, dy = fontSize * 0.35;
  // bubble cloud behind
  let cloud = "";
  for (let i = 0; i < text.length * 3; i++) {
    const bx = cx + R.range(-w * 0.38, w * 0.38);
    const by = cy + R.range(-h * 0.25, h * 0.25);
    cloud += `<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${R.range(24, 60).toFixed(1)}" ry="${R.range(18, 44).toFixed(1)}" fill="${p.outline}" opacity="0.9"/>`;
  }
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><filter id="soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs>
  <g transform="rotate(${R.range(-4, 4).toFixed(1)} ${cx} ${cy})">
    ${splatter(R, w, h, p.fill, 14, 8)}
    ${cloud}
    <g filter="url(#soft2)" opacity="0.45">
      <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${inner.fill}">${esc(text)}</text>
    </g>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="none" stroke="#ffffff" stroke-width="${(fontSize * 0.2).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${esc(text)}</text>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${inner.fill}">${esc(text)}</text>
    <text x="${cx - fontSize * 0.03}" y="${cy + dy - fontSize * 0.2}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${inner.hi}" opacity="0.6">${esc(text)}</text>
    ${drips(R, cx, cy + dy + fontSize * 0.32, R.int(4, 9), p.fill)}
    ${splatter(R, w, h, "#ffffff", 10, 3)}
  </g>
</svg>`;
}

/**
 * Wall piece — full-width mural tag with background wash and second tag.
 * Good for: large alley walls, level dressing.
 */
export function piece(main, sub = "", { seed = 3, w = 1200, h = 400 } = {}) {
  const R = rng(seed);
  const p = R.pick(PALETTES);
  const q = R.pick(PALETTES.filter((x) => x.name !== p.name));
  // background wash
  const wash = `<rect width="${w}" height="${h}" fill="${q.outline}" opacity="0.55"/>`;
  const fontSize = Math.min(h * 0.55, (w / Math.max(main.length, 1)) * 1.1);
  const cx = w / 2, cy = h * 0.46, dy = fontSize * 0.35;
  const subSvg = sub
    ? `<text x="${cx}" y="${(h * 0.82).toFixed(1)}" text-anchor="middle" font-family="${SCRIPT_FONT}" font-size="${(fontSize * 0.32).toFixed(1)}" fill="${q.hi}" opacity="0.9" transform="rotate(${R.range(-4, 4).toFixed(1)} ${cx} ${(h * 0.82).toFixed(1)})">${esc(sub)}</text>`
    : "";
  return `<svg ${XMLNS} width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><filter id="soft3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter></defs>
  ${wash}
  ${splatter(R, w, h, p.fill, 40, 10)}
  <g transform="rotate(${R.range(-3, 3).toFixed(1)} ${cx} ${cy})">
    <g filter="url(#soft3)" opacity="0.5">
      <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${p.fill}">${esc(main)}</text>
    </g>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="none" stroke="${p.outline}" stroke-width="${(fontSize * 0.16).toFixed(1)}" paint-order="stroke" stroke-linejoin="round">${esc(main)}</text>
    <text x="${cx}" y="${cy + dy}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${p.fill}">${esc(main)}</text>
    <text x="${cx - fontSize * 0.02}" y="${cy + dy - fontSize * 0.24}" text-anchor="middle" font-family="${DISPLAY_FONT}" font-size="${fontSize}" font-weight="900" fill="${p.hi}" opacity="0.5">${esc(main)}</text>
    ${drips(R, cx, cy + dy + fontSize * 0.3, R.int(6, 12), p.fill)}
  </g>
  ${subSvg}
  ${splatter(R, w, h, "#ffffff", 18, 3)}
</svg>`;
}

/** A set of crew tags for scattering around the world. */
export function crewSet(crews, { seed = 10 } = {}) {
  const R = rng(seed);
  return crews.map((c, i) =>
    tag(c, { seed: R.int(1, 99999), palette: PALETTES[i % PALETTES.length] })
  );
}

export const PALETTE_LIST = PALETTES;
