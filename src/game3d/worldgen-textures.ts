
// ---------------------------------------------------------------------------
// 3. Procedural canvas textures — the proprietary look
// ---------------------------------------------------------------------------

import * as THREE from "three";
import type { FactionId, Rng } from "./worldgen";

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!];
}

function toTexture(c: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function hex(n: number): string {
  return "#" + n.toString(16).padStart(6, "0");
}

/** Grime overlay — noise splotches for worn urban surfaces. */
function grime(ctx: CanvasRenderingContext2D, rng: Rng, w: number, h: number, count: number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const x = rng.range(0, w), y = rng.range(0, h), r = rng.range(4, 40);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = rng.chance(0.7);
    g.addColorStop(0, dark ? `rgba(10,8,8,${alpha})` : `rgba(200,190,170,${alpha * 0.5})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

/** Worn asphalt with cracks and patches. */
export function asphaltTexture(rng: Rng, base = "#232326"): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  // Aggregate speckle
  for (let i = 0; i < 2500; i++) {
    const v = rng.int(18, 58);
    ctx.fillStyle = `rgb(${v},${v},${v + rng.int(0, 6)})`;
    ctx.fillRect(rng.int(0, 255), rng.int(0, 255), 1.5, 1.5);
  }
  // Cracks
  ctx.strokeStyle = "rgba(8,8,10,0.7)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let x = rng.range(0, 256), y = rng.range(0, 256);
    ctx.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      x += rng.range(-30, 30); y += rng.range(-30, 30);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Patch rectangles (road repairs)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "rgba(12,12,14,0.5)";
    ctx.fillRect(rng.int(0, 200), rng.int(0, 200), rng.int(30, 80), rng.int(20, 50));
  }
  grime(ctx, rng, 256, 256, 24, 0.14);
  return toTexture(c, 8, 8);
}

/** Brick wall with mortar, color variation, wear. */
export function brickTexture(rng: Rng, base = "#6b4a3a"): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = "#2a2422"; // mortar
  ctx.fillRect(0, 0, 256, 256);
  const bh = 16, bw = 42;
  const baseC = new THREE.Color(base);
  for (let row = 0; row < 256 / bh; row++) {
    const off = (row % 2) * (bw / 2);
    for (let col = -1; col < 256 / bw + 1; col++) {
      const v = rng.range(0.82, 1.12);
      const cc = baseC.clone().multiplyScalar(v);
      ctx.fillStyle = hex(cc.getHex());
      ctx.fillRect(col * bw + off + 1, row * bh + 1, bw - 2, bh - 2);
      // individual brick wear
      if (rng.chance(0.12)) {
        ctx.fillStyle = "rgba(15,10,8,0.35)";
        ctx.fillRect(col * bw + off + 1, row * bh + 1, bw - 2, bh - 2);
      }
    }
  }
  grime(ctx, rng, 256, 256, 30, 0.16);
  return toTexture(c, 2, 2);
}

/** Building facade: windows grid with lit/unlit variation, per district mood. */
export function facadeTexture(
  rng: Rng,
  opts: { floors: number; cols: number; base: string; litRatio: number; warm: boolean }
): THREE.CanvasTexture {
  const W = 256, H = 256;
  const [c, ctx] = makeCanvas(W, H);
  ctx.fillStyle = opts.base;
  ctx.fillRect(0, 0, W, H);
  const cw = W / opts.cols, ch = H / opts.floors;
  for (let f = 0; f < opts.floors; f++) {
    for (let col = 0; col < opts.cols; col++) {
      const x = col * cw + cw * 0.22, y = f * ch + ch * 0.2;
      const w = cw * 0.56, h = ch * 0.6;
      const lit = rng.next() < opts.litRatio;
      if (lit) {
        const warm = opts.warm;
        const hue = warm ? rng.int(28, 45) : rng.int(195, 215);
        ctx.fillStyle = `hsl(${hue}, 70%, ${rng.int(55, 72)}%)`;
      } else {
        const v = rng.int(12, 30);
        ctx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
      }
      ctx.fillRect(x, y, w, h);
      // window frame
      ctx.strokeStyle = "rgba(10,10,12,0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      // cross mullion
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      // curtain variation on lit windows
      if (lit && rng.chance(0.4)) {
        ctx.fillStyle = "rgba(20,16,14,0.45)";
        ctx.fillRect(x, y, w * rng.range(0.3, 0.7), h);
      }
    }
  }
  grime(ctx, rng, W, H, 36, 0.12);
  return toTexture(c, 1, 1);
}

/** Concrete with stains and formwork lines. */
export function concreteTexture(rng: Rng, base = "#5a6068"): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    const v = rng.int(-14, 14);
    const cc = new THREE.Color(base).offsetHSL(0, 0, v / 255);
    ctx.fillStyle = hex(cc.getHex());
    ctx.fillRect(rng.int(0, 255), rng.int(0, 255), 2, 2);
  }
  // formwork seams
  ctx.strokeStyle = "rgba(20,20,22,0.4)";
  ctx.lineWidth = 2;
  for (let y = 0; y <= 256; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
  }
  // water stains from top
  for (let i = 0; i < 8; i++) {
    const x = rng.range(0, 256);
    const g = ctx.createLinearGradient(x, 0, x, 256);
    g.addColorStop(0, "rgba(25,22,18,0.4)");
    g.addColorStop(1, "rgba(25,22,18,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rng.range(4, 14), 0, rng.range(8, 28), 256);
  }
  grime(ctx, rng, 256, 256, 20, 0.1);
  return toTexture(c, 2, 2);
}

// ---------------------------------------------------------------------------
// Faction graffiti + signage — world storytelling through texture
// ---------------------------------------------------------------------------

const ASHES_TAGS = ["ASHES", "EMBER", "RISE", "CINDER", "BURN", "WARD 7", "NO KINGS"];
const COMBINE_SIGNS = ["KENNEDY CORP", "MERIDIAN CROSSING", "PRIVATE PROPERTY", "SECURED BY KCS", "NO TRESPASS"];
const HOLLOWS_TAGS = ["HOLLOW", "EMPTY", "THE QUIET", "LISTEN", "BELOW", "IT SEES"];
const PAINTED_TAGS = ["PAINT", "CLOWN", "SMILE", "FREAK", "HAHA"];

function tagFor(faction: FactionId, rng: Rng): string {
  switch (faction) {
    case "ashes": return rng.pick(ASHES_TAGS);
    case "combine": return rng.pick(COMBINE_SIGNS);
    case "hollows": return rng.pick(HOLLOWS_TAGS);
    case "painted": return rng.pick(PAINTED_TAGS);
    default: return rng.pick([...ASHES_TAGS, ...HOLLOWS_TAGS]);
  }
}

/** Spray-paint style graffiti tag on transparent background. */
export function graffitiTexture(rng: Rng, faction: FactionId, text?: string): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 128);
  ctx.clearRect(0, 0, 256, 128);
  const t = text ?? tagFor(faction, rng);
  // spray halo
  ctx.font = `bold ${rng.int(38, 56)}px Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const colors: Record<FactionId, string[]> = {
    ashes: ["#e4572e", "#ff7b3d", "#f0b429"],
    combine: ["#2e9bff", "#7cc4ff"],
    hollows: ["#9d4edd", "#6a2c91", "#c77dff"],
    painted: ["#ff2e88", "#00e5ff", "#aaff00"],
    unaffiliated: ["#cccccc", "#999999"],
    authority: ["#2e9bff", "#ffffff"],
  };
  const col = rng.pick(colors[faction]);
  // overspray
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = col + "22";
    const a = rng.range(0, Math.PI * 2), r = rng.range(20, 70);
    ctx.fillRect(128 + Math.cos(a) * r - 2, 64 + Math.sin(a) * r * 0.5 - 2, 4, 4);
  }
  ctx.save();
  ctx.translate(128, 64);
  ctx.rotate(rng.range(-0.08, 0.08));
  ctx.fillStyle = col;
  // drip effect: draw text then drips below random letters
  ctx.fillText(t, 0, 0);
  ctx.restore();
  // paint drips
  ctx.fillStyle = col + "aa";
  for (let i = 0; i < rng.int(2, 6); i++) {
    const x = rng.range(40, 216);
    ctx.fillRect(x, rng.range(70, 90), 3, rng.range(8, 30));
  }
  // outline for readability
  ctx.save();
  ctx.translate(128, 64); ctx.rotate(-0.02);
  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  ctx.lineWidth = 5;
  ctx.strokeText(t, 0, 0);
  ctx.fillStyle = col;
  ctx.fillText(t, 0, 0);
  ctx.restore();
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/** Neon sign — glowing text on dark backing. */
export function neonSignTexture(rng: Rng, text: string, color = "#00e5ff"): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 96);
  ctx.fillStyle = "#0a0a0e";
  ctx.fillRect(0, 0, 256, 96);
  ctx.font = "bold 44px 'Arial Narrow', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // glow layers
  for (const [blur, alpha] of [[18, 0.35], [10, 0.6], [4, 0.9]] as const) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillText(text, 128, 48);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  // tube highlight
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px 'Arial Narrow', sans-serif";
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, 128, 48);
  ctx.globalAlpha = 1;
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/** Corporate / municipal sign plate. */
export function plateSignTexture(text: string, sub: string, bg = "#1a2b4a", fg = "#dfe8f5"): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 128);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 112);
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.fillText(text, 128, 58);
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText(sub, 128, 92);
  const tex = toTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
