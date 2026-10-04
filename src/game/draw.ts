import { TILE, VIEW_H, VIEW_W, gateClosed, lockX, playerOf, type Actor, type Sim } from "./engine";

export type SpriteBank = {
  hero: HTMLImageElement[];
  heroIdle: HTMLImageElement[];
  heroRun: HTMLImageElement[];
  heroAtk: HTMLImageElement[];
  grunt: HTMLImageElement[];
  bruiser: HTMLImageElement[];
  bolt: HTMLImageElement[];
  spark: HTMLImageElement[];
  mira: HTMLImageElement[];
  voss: HTMLImageElement[];
};

const INK = "#14110e";
const CREAM = "#f3e6d4";
const EMBER = "#e4572e";
const BRASS = "#f0b429";

function camera(sim: Sim) {
  const player = playerOf(sim);
  const worldW = sim.room.rows[0].length * TILE;
  const worldH = sim.room.rows.length * TILE;
  let x = player.x - VIEW_W / 2;
  let y = player.y - VIEW_H / 2;
  if (worldW <= VIEW_W) x = (worldW - VIEW_W) / 2;
  else x = Math.max(0, Math.min(worldW - VIEW_W, x));
  if (worldH <= VIEW_H) y = (worldH - VIEW_H) / 2;
  else y = Math.max(0, Math.min(worldH - VIEW_H, y));
  return { x: Math.round(x), y: Math.round(y) };
}

function project(sim: Sim, x: number, y: number, camX: number) {
  const rows = sim.room.rows.length;
  const sy = 48 + (y / TILE / rows) * 114;
  const t = y / (rows * TILE);
  return { sx: x - camX, sy, scale: 0.76 + t * 0.46 };
}

function blot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  rows: string[],
  colors: Record<string, string>,
  flip: boolean,
) {
  const h = rows.length;
  const w = Math.max(...rows.map((row) => row.length));
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.translate(Math.round((-w * scale) / 2), Math.round(-h * scale));
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      const color = colors[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(c * scale), Math.round(r * scale), Math.ceil(scale), Math.ceil(scale));
    }
  }
  ctx.restore();
}

const PAL: Record<string, string> = {
  H: "#1a120e",
  S: "#c4845a",
  E: "#f0b429",
  R: "#e4572e",
  C: "#f0b429",
  K: "#2a241e",
  B: "#4a3428",
  W: "#f3e6d4",
  G: "#6d6258",
  V: "#3d342c",
  O: "#e4572e",
  N: "#1e3a5f",
  T: "#2f6f68",
  L: "#d7c3a4",
};

const HERO_IDLE = [
  "....HHHHH.....",
  "...HHSSSHH....",
  "...HSESESH....",
  "...HSSSSSH....",
  "..RRRRRRRR....",
  ".RRRCRRRRRR...",
  "..RRRRRRRR....",
  "...KKKKKK.....",
  "...KKKKKK.....",
  "..KKK..KKK....",
  "..KK....KK....",
  "..BB....BB....",
];

const HERO_STEP = [
  "....HHHHH.....",
  "...HHSSSHH....",
  "...HSESESH....",
  "...HSSSSSH....",
  "..RRRRRRRR....",
  ".RRRCRRRRRR...",
  "..RRRRRRRR....",
  "...KKKKKK.....",
  "..KKKKKKK.....",
  ".KKK....KK....",
  ".BB......KK...",
  "........BB....",
];

const HERO_PUNCH = [
  "....HHHHH........",
  "...HHSSSHH.......",
  "...HSESESH..C....",
  "...HSSSSSH.CCC...",
  "..RRRRRRRRCCC....",
  ".RRRCRRRRRR......",
  "..RRRRRRRR.......",
  "...KKKKKK........",
  "...KKKKKK........",
  "..KKK..KKK.......",
  "..BB....BB.......",
];

const GRUNT = [
  "...GGGGGG....",
  "..GGSSSSGG...",
  "..GSEESSGG...",
  "..GSSSSSGG...",
  "...VVVVVV....",
  "..VVVVVVV....",
  "..VVCVVVV....",
  "...KKKKK.....",
  "..KKK.KKK....",
  "..KK...KK....",
  "..BB...BB....",
];

const BRUTE = [
  "....HHHHHH....",
  "...HSSSSSSH...",
  "...HSEEEESH...",
  "...HSSSSSSH...",
  "..OOOOOOOOOO..",
  ".OOOOCOOOOOO..",
  ".OOOOOOOOOOO..",
  "..OOOOOOOOOO..",
  "...KKKKKKKK...",
  "..KKKKKKKKKK..",
  "..KKK....KKK..",
  "..BBB....BBB..",
];

const TOP: Record<string, string[]> = {
  s: ["..HHHH..", ".HSSSSH.", ".SEEEES.", ".SSSSSS.", ".RRRRRR.", "RRCRRRRR", ".KKKKKK.", ".B....B."],
  n: ["..HHHH..", ".HHHHHH.", ".HSSSSH.", ".RRRRRR.", "RRCRRRRR", ".RRRRRR.", ".KKKKKK.", ".B....B."],
  e: ["...HHH..", "..HSSSH.", "..SEESH.", ".RRRRRR.", "RRCRRRR.", ".KKKKKK.", "..B..B..", "...BB..."],
  w: ["..HHH...", ".HSSSH..", ".HSEES..", ".RRRRRR.", ".RRRCRRR", ".KKKKKK.", "..B..B..", "...BB..."],
};

const TOP_MIRA: Record<string, string[]> = {
  s: ["..HHHH..", ".HSSSSH.", ".SEWEES.", ".TTTTTT.", ".TTTTTT.", ".KKKKKK.", ".B....B."],
  n: ["..HHHH..", ".HHHHHH.", ".TTTTTT.", ".TTTTTT.", ".KKKKKK.", ".B....B."],
  e: ["...HH...", "..HSSH..", ".TTTTT..", ".TTTTT..", ".KKKKK..", "..B.B..."],
  w: ["...HH...", "..HSSH..", "..TTTTT.", "..TTTTT.", "..KKKKK.", "...B.B.."],
};

const TOP_VOSS: Record<string, string[]> = {
  s: ["..WWWW..", ".WSSSSW.", ".SEEEES.", ".NNNNNN.", ".NNNNNN.", ".KKKKKK.", ".B....B."],
  n: ["..WWWW..", ".WWWWWW.", ".NNNNNN.", ".NNNNNN.", ".KKKKKK.", ".B....B."],
  e: ["..WWW...", ".WSSSW..", ".NNNNN..", ".NNNNN..", ".KKKKK..", "..B.B..."],
  w: ["...WWW..", "..WSSSW.", "..NNNNN.", "..NNNNN.", "..KKKKK.", "...B.B.."],
};

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, lift: number) {
  ctx.fillStyle = "rgba(12,8,6,0.4)";
  ctx.beginPath();
  ctx.ellipse(x, y, w, Math.max(2, 4 - lift * 0.02), 0, 0, Math.PI * 2);
  ctx.fill();
}

function spriteFrame(frames: HTMLImageElement[] | undefined, index: number) {
  if (!frames?.length) return null;
  return frames[index % frames.length] ?? null;
}

function paintSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetH: number,
  flip: boolean,
) {
  const scale = targetH / img.height;
  const w = img.width * scale;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, Math.round(-w / 2), Math.round(-targetH), Math.round(w), Math.round(targetH));
  ctx.restore();
}

function drawActor(ctx: CanvasRenderingContext2D, sim: Sim, actor: Actor, at: { x: number; y: number }, bank: SpriteBank | null, height: number) {
  if (actor.iframe > 0 && Math.floor(sim.time * 24) % 2 === 0 && actor.kind === "player") return;
  const step = Math.floor(sim.time * (actor.state === "walk" || actor.state === "dash" ? 10 : 3)) % 2;
  const flip = actor.facing < 0;
  drawShadow(ctx, at.x, at.y, height * 0.28, actor.z);
  const feetY = at.y - actor.z;
  if (actor.flash > 0) ctx.filter = "brightness(2.4)";
  if (sim.room.mode === "brawl" && bank) {
    let img: HTMLImageElement | null = null;
    if (actor.kind === "player") {
      if (actor.state === "atk") img = spriteFrame(bank.heroAtk, Math.min(3, Math.floor(actor.stateT * 16)));
      else if (actor.state === "walk" || actor.state === "dash") img = spriteFrame(bank.heroRun, step);
      else img = spriteFrame(bank.heroIdle, step);
    } else if (actor.kind === "grunt") img = spriteFrame(bank.grunt, step);
    else if (actor.kind === "bruiser") img = spriteFrame(bank.bruiser, step);
    if (img) {
      paintSprite(ctx, img, at.x, feetY, height * (actor.kind === "bruiser" ? 1.2 : 1), flip);
      ctx.filter = "none";
      return;
    }
  }
  if (sim.room.mode === "roam" && bank && actor.kind !== "grunt" && actor.kind !== "bruiser") {
    const row = actor.dir === "s" ? 0 : actor.dir === "w" ? 1 : actor.dir === "e" ? 2 : 3;
    const col = actor.state === "idle" ? (step === 0 ? 0 : 2) : step === 0 ? 1 : 3;
    const sheet = actor.kind === "npc" ? (actor.npcIndex % 2 === 0 ? bank.mira : bank.voss) : bank.hero;
    const img = sheet[row * 4 + col];
    if (img) {
      paintSprite(ctx, img, at.x, feetY, height, false);
      ctx.filter = "none";
      return;
    }
  }
  if (sim.room.mode === "brawl") {
    const grid = actor.kind === "player" ? (actor.state === "atk" ? HERO_PUNCH : step ? HERO_STEP : HERO_IDLE) : actor.kind === "bruiser" ? BRUTE : GRUNT;
    blot(ctx, at.x, feetY, Math.max(1.4, height / 16), grid, PAL, flip && actor.state !== "atk" ? true : flip);
  } else {
    const pack = actor.kind === "npc" ? (actor.npcIndex % 2 === 0 ? TOP_MIRA : TOP_VOSS) : TOP;
    const grid = pack[actor.dir] ?? pack.s;
    blot(ctx, at.x, feetY, Math.max(1.5, height / 12), grid, PAL, false);
  }
  ctx.filter = "none";
  if (actor.hp > 0 && actor.hp < actor.maxHp && actor.kind !== "player" && actor.kind !== "npc") {
    const w = 18;
    ctx.fillStyle = INK;
    ctx.fillRect(at.x - w / 2, feetY - height - 6, w, 3);
    ctx.fillStyle = EMBER;
    ctx.fillRect(at.x - w / 2, feetY - height - 6, w * (actor.hp / actor.maxHp), 3);
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function drawHud(ctx: CanvasRenderingContext2D, sim: Sim) {
  const player = playerOf(sim);
  ctx.fillStyle = "rgba(20,17,14,0.72)";
  ctx.fillRect(8, 6, 78, 8);
  ctx.fillStyle = EMBER;
  ctx.fillRect(8, 6, 78 * (player.hp / player.maxHp), 8);
  ctx.strokeStyle = CREAM;
  ctx.strokeRect(8.5, 6.5, 77, 7);
  ctx.fillStyle = "rgba(20,17,14,0.72)";
  ctx.fillRect(VIEW_W - 70, 6, 62, 8);
  ctx.fillStyle = BRASS;
  ctx.fillRect(VIEW_W - 70, 6, 62 * (player.meter / 100), 8);
  ctx.strokeStyle = CREAM;
  ctx.strokeRect(VIEW_W - 69.5, 6.5, 61, 7);
  ctx.font = "7px Silkscreen, monospace";
  ctx.fillStyle = CREAM;
  ctx.fillText("HP", 10, 20);
  ctx.fillText("COIL", VIEW_W - 68, 20);
  if (sim.bannerT > 0) {
    ctx.fillStyle = BRASS;
    ctx.font = "8px Silkscreen, monospace";
    ctx.textAlign = "center";
    ctx.fillText(sim.banner.toUpperCase(), VIEW_W / 2, 22);
    ctx.textAlign = "left";
  }
  if (player.comboWait > 0 && player.combo > 0) {
    ctx.fillStyle = CREAM;
    ctx.font = "8px Silkscreen, monospace";
    ctx.fillText(`${player.combo + 1} HIT`, 8, 34);
  }
  if (sim.dialog) {
    ctx.fillStyle = "rgba(20,17,14,0.92)";
    ctx.fillRect(10, VIEW_H - 48, VIEW_W - 20, 40);
    ctx.strokeStyle = BRASS;
    ctx.strokeRect(10.5, VIEW_H - 47.5, VIEW_W - 21, 39);
    ctx.fillStyle = BRASS;
    ctx.font = "7px Silkscreen, monospace";
    ctx.fillText(sim.dialog.name.toUpperCase(), 16, VIEW_H - 34);
    ctx.fillStyle = CREAM;
    const lines = wrap(ctx, sim.dialog.text, VIEW_W - 36);
    lines.forEach((line, i) => ctx.fillText(line, 16, VIEW_H - 22 + i * 9));
  }
  for (const floater of sim.floats) {
    ctx.globalAlpha = Math.max(0, floater.life / floater.max);
    ctx.fillStyle = BRASS;
    ctx.font = "8px Silkscreen, monospace";
    ctx.fillText(floater.text, floater.x, floater.y - (1 - floater.life / floater.max) * 10);
    ctx.globalAlpha = 1;
  }
}

function drawRoam(ctx: CanvasRenderingContext2D, sim: Sim, bank: SpriteBank | null) {
  const cam = camera(sim);
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const rows = sim.room.rows;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      const x = Math.round(c * TILE - cam.x);
      const y = Math.round(r * TILE - cam.y);
      if (ch === "#") continue;
      const alt = (c + r * 3) % 2 === 0;
      ctx.fillStyle = alt ? "#5c4636" : "#4e3c2e";
      ctx.fillRect(x, y, TILE, TILE);
      if ((c * 5 + r) % 7 === 0) {
        ctx.fillStyle = "rgba(20,14,10,0.25)";
        ctx.fillRect(x + 3, y + 8, 4, 2);
      }
      if (ch === "D") {
        ctx.fillStyle = "#2a1c14";
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = BRASS;
        ctx.fillRect(x + 1, y, 2, TILE);
        ctx.fillRect(x + TILE - 3, y, 2, TILE);
      }
      if (ch === "S") {
        ctx.fillStyle = "#6b4a34";
        ctx.fillRect(x + 6, y + 4, 4, 10);
        ctx.fillStyle = CREAM;
        ctx.fillRect(x + 3, y + 2, 10, 6);
      }
      if (ch === "|") {
        ctx.fillStyle = gateClosed(sim) ? EMBER : "rgba(240,180,41,0.3)";
        ctx.fillRect(x + 7, y, 2, TILE);
      }
    }
  }
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] !== "#") continue;
      const x = Math.round(c * TILE - cam.x);
      const y = Math.round(r * TILE - cam.y);
      ctx.fillStyle = "#6a513c";
      ctx.fillRect(x, y - 5, TILE, TILE);
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(x, y + TILE - 8, TILE, 8);
      if ((c + r) % 4 === 0) {
        ctx.fillStyle = EMBER;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x + 6, y + 2, 3, 3);
        ctx.globalAlpha = 1;
      }
    }
  }
  for (const pickup of sim.pickups) {
    if (pickup.taken) continue;
    const x = pickup.x - cam.x;
    const y = pickup.y - cam.y + Math.sin(sim.time * 5 + pickup.x) * 1.2;
    ctx.fillStyle = pickup.kind === "H" ? EMBER : BRASS;
    ctx.beginPath();
    ctx.arc(x, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CREAM;
    ctx.fillRect(x - 1, y - 6, 2, 4);
  }
  const drawables = sim.actors
    .filter((actor) => !actor.gone)
    .map((actor) => ({ actor, x: actor.x - cam.x, y: actor.y - cam.y }));
  drawables.sort((a, b) => a.y - b.y);
  for (const item of drawables) drawActor(ctx, sim, item.actor, item, bank, item.actor.kind === "bruiser" ? 30 : 26);
  for (const bolt of sim.bolts) {
    const img = bank ? spriteFrame(bank.bolt, Math.floor(sim.time * 12)) : null;
    if (img) paintSprite(ctx, img, bolt.x - cam.x, bolt.y - cam.y, 16, bolt.vx < 0);
    else {
      ctx.fillStyle = BRASS;
      ctx.beginPath();
      ctx.arc(bolt.x - cam.x, bolt.y - cam.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const particle of sim.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.max);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - cam.x, particle.y - cam.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawBrawl(ctx: CanvasRenderingContext2D, sim: Sim, bank: SpriteBank | null) {
  const camX = camera(sim).x;
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, "#120e0c");
  sky.addColorStop(0.42, "#3a2218");
  sky.addColorStop(1, "#16110e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = CREAM;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(248 - camX * 0.05, 26, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 9; i++) {
    const bx = ((i * 54 - camX * 0.3) % (VIEW_W + 70) + VIEW_W + 70) % (VIEW_W + 70) - 30;
    const bh = 26 + ((i * 29) % 28);
    ctx.fillStyle = i % 2 ? "#241812" : "#1a120e";
    ctx.fillRect(bx, 46 - bh, 40, bh);
    ctx.fillStyle = EMBER;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(bx + 6, 50 - bh + 8, 4, 3);
    ctx.fillRect(bx + 16, 52 - bh + 8, 4, 3);
    ctx.fillRect(bx + 26, 50 - bh + 14, 4, 3);
    ctx.globalAlpha = 1;
  }
  const rows = sim.room.rows.length;
  for (let r = 0; r < rows; r++) {
    const y0 = 48 + (r / rows) * 114;
    const y1 = 48 + ((r + 1) / rows) * 114;
    const t = r / Math.max(1, rows - 1);
    const red = Math.round(54 + t * 48);
    const green = Math.round(36 + t * 26);
    const blue = Math.round(26 + t * 10);
    ctx.fillStyle = `rgb(${red},${green},${blue})`;
    ctx.fillRect(0, y0, VIEW_W, y1 - y0 + 1);
    ctx.fillStyle = "rgba(243,230,212,0.05)";
    ctx.fillRect(0, y1 - 1, VIEW_W, 1);
  }
  const cols = sim.room.rows[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = sim.room.rows[r][c];
      if (ch !== "#" || r === 0 || r === rows - 1) continue;
      const pos = project(sim, c * TILE + TILE / 2, r * TILE + TILE / 2, camX);
      ctx.fillStyle = "#3a2a22";
      ctx.fillRect(pos.sx - 8, pos.sy - 16 * pos.scale, 16, 16 * pos.scale);
      ctx.fillStyle = "#6a513c";
      ctx.fillRect(pos.sx - 8, pos.sy - 18 * pos.scale, 16, 4);
    }
  }
  const gate = lockX(sim.room);
  if (gate != null && gateClosed(sim)) {
    const pos = project(sim, gate, sim.room.rows.length * TILE * 0.5, camX);
    ctx.fillStyle = "rgba(228,87,46,0.35)";
    ctx.fillRect(pos.sx, 52, 3, 100);
    ctx.fillStyle = BRASS;
    ctx.globalAlpha = 0.5 + Math.sin(sim.time * 8) * 0.3;
    ctx.fillRect(pos.sx, 58, 3, 8);
    ctx.fillRect(pos.sx, 92, 3, 8);
    ctx.fillRect(pos.sx, 124, 3, 8);
    ctx.globalAlpha = 1;
  }
  for (const pickup of sim.pickups) {
    if (pickup.taken) continue;
    const pos = project(sim, pickup.x, pickup.y, camX);
    ctx.fillStyle = pickup.kind === "H" ? EMBER : BRASS;
    ctx.beginPath();
    ctx.arc(pos.sx, pos.sy - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const items = sim.actors
    .filter((actor) => !actor.gone)
    .map((actor) => ({ actor, ...project(sim, actor.x, actor.y, camX) }));
  items.sort((a, b) => a.sy - b.sy);
  for (const item of items) {
    drawActor(ctx, sim, item.actor, { x: item.sx, y: item.sy }, bank, 46 * item.scale);
  }
  for (const bolt of sim.bolts) {
    const pos = project(sim, bolt.x, bolt.y + 8, camX);
    const img = bank ? spriteFrame(bank.bolt, Math.floor(sim.time * 12)) : null;
    if (img) paintSprite(ctx, img, pos.sx, pos.sy - 6, 18, bolt.vx < 0);
    else {
      ctx.fillStyle = BRASS;
      ctx.fillRect(pos.sx - 5, pos.sy - 10, 10, 4);
      ctx.fillStyle = CREAM;
      ctx.fillRect(pos.sx - 2, pos.sy - 9, 3, 2);
    }
  }
  for (const particle of sim.particles) {
    const pos = project(sim, particle.x, particle.y, camX);
    ctx.globalAlpha = Math.max(0, particle.life / particle.max);
    ctx.fillStyle = particle.color;
    ctx.fillRect(pos.sx, pos.sy, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

export function drawWorld(canvas: HTMLCanvasElement, sim: Sim, bank: SpriteBank | null) {
  if (canvas.width !== VIEW_W) canvas.width = VIEW_W;
  if (canvas.height !== VIEW_H) canvas.height = VIEW_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const mag = sim.reduced ? 0 : sim.trauma * sim.trauma * 5;
  ctx.save();
  ctx.translate(Math.sin(sim.time * 43) * mag, Math.cos(sim.time * 37) * mag);
  if (sim.room.mode === "brawl") drawBrawl(ctx, sim, bank);
  else drawRoam(ctx, sim, bank);
  ctx.restore();
  drawHud(ctx, sim);
}

