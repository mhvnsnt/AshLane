/**
 * svg-textures.js — Procedural SVG texture generators for AshLane.
 * Everything is resolution-independent SVG using feTurbulence noise filters.
 * Output can be saved as .svg files or embedded as data URIs in CSS.
 *
 * Usage (Node):
 *   import { concrete, asphalt, brick, chainlink } from './svg-textures.js';
 *   fs.writeFileSync('concrete.svg', concrete({ seed: 7 }));
 *
 * Usage (CSS):
 *   background-image: url("data:image/svg+xml,...");
 *
 * All generators accept { seed, size } and return an SVG string.
 */
import { rng, esc } from "./rng.js";

const XMLNS = 'xmlns="http://www.w3.org/2000/svg"';

/** Shared fractal-noise filter definition. */
function noiseFilter(id, baseFrequency, octaves, seed) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${octaves}" seed="${seed}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" result="na"/>
    <feComposite in="SourceGraphic" in2="na" operator="in" result="masked"/>
  </filter>`;
}

function svgOpen(size, extra = "") {
  return `<svg ${XMLNS} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" ${extra}>`;
}

/**
 * Concrete — light gray with fine grain + subtle stains.
 * Good for: sidewalks, walls, warehouse floors.
 */
export function concrete({ seed = 1, size = 512, tone = "#9a9a98" } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let stains = "";
  for (let i = 0; i < 6; i++) {
    const cx = R.range(0, size), cy = R.range(0, size), r = R.range(30, 120);
    const op = R.range(0.04, 0.12).toFixed(3);
    stains += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * R.range(0.5, 1)).toFixed(1)}" fill="#3a3a38" opacity="${op}"/>`;
  }
  // hairline cracks
  let cracks = "";
  for (let i = 0; i < 3; i++) {
    let x = R.range(0, size), y = R.range(0, size);
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const steps = R.int(4, 8);
    for (let s = 0; s < steps; s++) {
      x += R.range(-40, 40); y += R.range(-40, 40);
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    cracks += `<path d="${d}" stroke="#4a4a48" stroke-width="${R.range(0.6, 1.4).toFixed(1)}" fill="none" opacity="0.5"/>`;
  }
  return `${svgOpen(size)}
  <defs>${noiseFilter("grain", "0.9", 3, fSeed)}</defs>
  <rect width="${size}" height="${size}" fill="${tone}"/>
  ${stains}
  <rect width="${size}" height="${size}" fill="#6a6a68" filter="url(#grain)" opacity="0.5"/>
  ${cracks}
</svg>`;
}

/**
 * Asphalt — dark with aggregate speckles + oil stains.
 * Good for: streets, parking lots, rooftops.
 */
export function asphalt({ seed = 2, size = 512 } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let speckles = "";
  for (let i = 0; i < 900; i++) {
    const x = R.range(0, size), y = R.range(0, size);
    const r = R.range(0.6, 2.2);
    const shade = R.pick(["#4a4a4c", "#555558", "#3c3c3e", "#606062"]);
    speckles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${shade}" opacity="${R.range(0.4, 0.9).toFixed(2)}"/>`;
  }
  // oil stains with rainbow-ish sheen hint
  let stains = "";
  for (let i = 0; i < 4; i++) {
    const cx = R.range(0, size), cy = R.range(0, size), r = R.range(25, 90);
    stains += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.7).toFixed(1)}" fill="#151517" opacity="${R.range(0.15, 0.3).toFixed(2)}"/>`;
  }
  // faded lane marking fragment
  let marking = "";
  if (R.chance(0.6)) {
    const y = R.range(size * 0.3, size * 0.7);
    marking = `<rect x="0" y="${y.toFixed(1)}" width="${size}" height="${(size * 0.03).toFixed(1)}" fill="#c8b23a" opacity="0.28" filter="url(#wear)"/>`;
  }
  return `${svgOpen(size)}
  <defs>
    ${noiseFilter("grain", "0.8", 3, fSeed)}
    <filter id="wear" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="2" seed="${fSeed + 1}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="8"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="#2e2e30"/>
  <rect width="${size}" height="${size}" fill="#555" filter="url(#grain)" opacity="0.55"/>
  ${stains}
  ${speckles}
  ${marking}
</svg>`;
}

/**
 * Brick wall — staggered courses with mortar + per-brick tonal variation.
 * Good for: alley walls, building exteriors.
 */
export function brick({ seed = 3, size = 512, brickW = 64, brickH = 32, mortar = "#8d8578", palette = ["#8a4030", "#93482f", "#7c3a2c", "#9c5138", "#83402e"] } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let bricks = "";
  const rows = Math.ceil(size / brickH);
  for (let row = 0; row < rows; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let x = -brickW; x < size + brickW; x += brickW) {
      const bx = x + offset + R.range(-1.5, 1.5);
      const by = row * brickH + R.range(-1, 1);
      const c = R.pick(palette);
      // per-brick shading noise via slight overlay
      const dark = R.chance(0.3);
      bricks += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(brickW - 3).toFixed(1)}" height="${(brickH - 3).toFixed(1)}" fill="${c}"/>`;
      if (dark) bricks += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(brickW - 3).toFixed(1)}" height="${(brickH - 3).toFixed(1)}" fill="#000" opacity="${R.range(0.05, 0.18).toFixed(2)}"/>`;
      // top highlight
      bricks += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(brickW - 3).toFixed(1)}" height="2" fill="#fff" opacity="0.06"/>`;
    }
  }
  return `${svgOpen(size)}
  <defs>${noiseFilter("grime", "0.12", 2, fSeed)}</defs>
  <rect width="${size}" height="${size}" fill="${mortar}"/>
  ${bricks}
  <rect width="${size}" height="${size}" fill="#2a241e" filter="url(#grime)" opacity="0.35"/>
</svg>`;
}

/**
 * Chain-link fence — diamond wire pattern, tileable.
 * Good for: overlays on transparent bg, cages, barriers.
 */
export function chainlink({ seed = 4, size = 256, cell = 32, wire = "#9aa0a6", wireW = 2.5 } = {}) {
  const R = rng(seed);
  let wires = "";
  const hw = cell / 2;
  // two diagonal wire families make the diamonds
  for (let y = -cell; y < size + cell; y += cell) {
    for (let x = -cell; x < size + cell; x += cell) {
      wires += `<line x1="${x}" y1="${y}" x2="${x + cell}" y2="${y + cell}" stroke="${wire}" stroke-width="${wireW}"/>`;
      wires += `<line x1="${x + cell}" y1="${y}" x2="${x}" y2="${y + cell}" stroke="${wire}" stroke-width="${wireW}"/>`;
    }
  }
  // slight irregularity overlay for realism
  let knots = "";
  for (let y = 0; y <= size; y += cell) {
    for (let x = 0; x <= size; x += cell) {
      if (R.chance(0.85)) {
        knots += `<circle cx="${x}" cy="${y}" r="${(wireW * 1.1).toFixed(1)}" fill="${wire}"/>`;
      }
    }
  }
  return `${svgOpen(size)}
  <g opacity="0.9">${wires}</g>
  ${knots}
</svg>`;
}

/**
 * Corrugated metal — vertical ribs with rust streaks.
 * Good for: warehouse walls, shutters, fences.
 */
export function corrugated({ seed = 5, size = 512, ribW = 32, base = "#7d8287" } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let ribs = "";
  for (let x = 0; x < size; x += ribW) {
    ribs += `<rect x="${x}" y="0" width="${ribW / 2}" height="${size}" fill="#fff" opacity="0.10"/>`;
    ribs += `<rect x="${x + ribW / 2}" y="0" width="${ribW / 2}" height="${size}" fill="#000" opacity="0.14"/>`;
    ribs += `<line x1="${x}" y1="0" x2="${x}" y2="${size}" stroke="#3c3f43" stroke-width="1.5" opacity="0.6"/>`;
  }
  let rust = "";
  for (let i = 0; i < 8; i++) {
    const x = R.range(0, size), w = R.range(4, 18), h = R.range(40, 200);
    rust += `<rect x="${x.toFixed(1)}" y="${R.range(0, size * 0.4).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#6e3b1f" opacity="${R.range(0.15, 0.4).toFixed(2)}"/>`;
  }
  return `${svgOpen(size)}
  <defs>${noiseFilter("grime", "0.2", 2, fSeed)}</defs>
  <rect width="${size}" height="${size}" fill="${base}"/>
  ${ribs}
  ${rust}
  <rect width="${size}" height="${size}" fill="#222" filter="url(#grime)" opacity="0.3"/>
</svg>`;
}

/**
 * Sidewalk — concrete paver grid with expansion joints.
 */
export function sidewalk({ seed = 6, size = 512, paver = 128 } = {}) {
  const R = rng(seed);
  const fSeed = R.int(1, 999);
  let joints = "";
  for (let x = 0; x <= size; x += paver) {
    joints += `<line x1="${x}" y1="0" x2="${x}" y2="${size}" stroke="#55554f" stroke-width="4"/>`;
    joints += `<line x1="0" y1="${x}" x2="${size}" y2="${x}" stroke="#55554f" stroke-width="4"/>`;
  }
  // gum spots
  let gum = "";
  for (let i = 0; i < 25; i++) {
    gum += `<circle cx="${R.range(0, size).toFixed(1)}" cy="${R.range(0, size).toFixed(1)}" r="${R.range(2, 5).toFixed(1)}" fill="#2b2b28" opacity="${R.range(0.4, 0.7).toFixed(2)}"/>`;
  }
  return `${svgOpen(size)}
  <defs>${noiseFilter("grain", "0.7", 3, fSeed)}</defs>
  <rect width="${size}" height="${size}" fill="#a3a39e"/>
  <rect width="${size}" height="${size}" fill="#77776f" filter="url(#grain)" opacity="0.45"/>
  ${gum}
  ${joints}
</svg>`;
}

/** Registry of all texture generators for iteration. */
export const TEXTURES = { concrete, asphalt, brick, chainlink, corrugated, sidewalk };
