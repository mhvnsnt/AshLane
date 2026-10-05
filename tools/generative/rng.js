/**
 * rng.js — Seeded random number generation for AshLane generative tools.
 * Mulberry32 PRNG + helpers. Deterministic: same seed = same output.
 * Works in Node and browsers. No dependencies.
 */

/** Create a seeded RNG. Seed can be a number or string. */
export function mulberry32(seed) {
  let a = typeof seed === "string" ? hashStr(seed) : (seed >>> 0);
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Build a helper bundle from a seed: rand(), int(), pick(), range(), etc. */
export function rng(seed) {
  const rand = mulberry32(seed);
  return {
    rand,
    /** float in [min, max) */
    range: (min, max) => min + rand() * (max - min),
    /** int in [min, max] */
    int: (min, max) => Math.floor(min + rand() * (max - min + 1)),
    /** pick one element */
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    /** pick n unique elements */
    pickN: (arr, n) => {
      const copy = [...arr];
      const out = [];
      for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
      }
      return out;
    },
    /** true with probability p */
    chance: (p) => rand() < p,
    /** shuffle a copy */
    shuffle: (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
}

/** Escape XML special chars for SVG text content. */
export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap an SVG string as a data URI for use in CSS / <img> src.
 * Usage: `background-image: url("${svgDataUri(svg)}")`
 */
export function svgDataUri(svg) {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
