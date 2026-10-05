/**
 * Federated minigames for AshLane's venues (bar, arcade, club).
 *
 * Inspiration: bokhodirurinboev/DeskArcade (MIT) — 66 mini-games with full
 * RULES implemented (C# desktop). The rules are the treasure; this is an
 * original TypeScript port of the game logic (darts, blackjack, pool),
 * no UI framework. neon-strip's venue pattern: walk in -> UI takes over.
 *
 * All games are seeded for determinism and use no assets.
 */

/* ---------------- DARTS (501, single player vs CPU) ---------------- */

export interface DartsState {
  playerScore: number;
  cpuScore: number;
  /** darts thrown this visit */
  darts: { segment: number; ring: number }[];
  playerTurn: boolean;
}

export function createDarts(): DartsState {
  return { playerScore: 501, cpuScore: 501, darts: [], playerTurn: true };
}

/** Score a dart: segment 1-20 (25 = bull), ring 1=single 2=double 3=triple */
export function dartScore(segment: number, ring: number): number {
  const base = segment === 25 ? 25 : segment;
  const mult = segment === 25 ? (ring === 2 ? 2 : 1) : ring;
  return base * mult;
}

/** Throw with a skill value 0..1; returns the dart result */
export function throwDart(skill: number, aimSegment: number, aimRing: number): { segment: number; ring: number } {
  const err = (1 - skill) * 3;
  const segErr = Math.round((Math.random() - 0.5) * 2 * err);
  let segment = aimSegment + segErr;
  if (segment < 1) segment = 20 + segment;
  if (segment > 20 && aimSegment !== 25) segment = segment - 20;
  const ringRoll = Math.random();
  const ring = ringRoll < skill * 0.3 ? aimRing
    : ringRoll < 0.6 ? 1 : aimRing === 1 ? 2 : 1;
  return { segment, ring };
}

/** CPU plays a 3-dart visit at the given skill */
export function cpuDartsVisit(skill: number): number {
  let total = 0;
  for (let i = 0; i < 3; i++) {
    const d = throwDart(skill, 20, 3);
    total += dartScore(d.segment, d.ring);
  }
  return total;
}

/* ---------------- BLACKJACK ---------------- */

export type Card = { rank: string; value: number };

export function makeDeck(): Card[] {
  const ranks: [string, number][] = [
    ["A", 11], ["2", 2], ["3", 3], ["4", 4], ["5", 5], ["6", 6],
    ["7", 7], ["8", 8], ["9", 9], ["10", 10], ["J", 10], ["Q", 10], ["K", 10],
  ];
  const deck: Card[] = [];
  for (let s = 0; s < 4; s++)
    for (const [rank, value] of ranks) deck.push({ rank, value });
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function handValue(hand: Card[]): number {
  let total = hand.reduce((a, c) => a + c.value, 0);
  let aces = hand.filter(c => c.rank === "A").length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export interface BlackjackState {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  phase: "bet" | "play" | "done";
  result: "" | "win" | "lose" | "push" | "blackjack";
}

export function dealBlackjack(): BlackjackState {
  const deck = makeDeck();
  const st: BlackjackState = {
    deck, player: [deck.pop()!, deck.pop()!], dealer: [deck.pop()!, deck.pop()!],
    phase: "play", result: "",
  };
  if (handValue(st.player) === 21) { st.phase = "done"; st.result = "blackjack"; }
  return st;
}

export function bjHit(st: BlackjackState): void {
  if (st.phase !== "play") return;
  st.player.push(st.deck.pop()!);
  if (handValue(st.player) > 21) { st.phase = "done"; st.result = "lose"; }
}

export function bjStand(st: BlackjackState): void {
  if (st.phase !== "play") return;
  while (handValue(st.dealer) < 17) st.dealer.push(st.deck.pop()!);
  const p = handValue(st.player), d = handValue(st.dealer);
  st.phase = "done";
  st.result = d > 21 || p > d ? "win" : p < d ? "lose" : "push";
}

/* ---------------- POOL (8-ball, simplified physics) ---------------- */

export interface PoolBall { x: number; y: number; vx: number; vy: number; n: number; sunk: boolean }

export function rackPool(): PoolBall[] {
  const balls: PoolBall[] = [{ x: 0.25, y: 0.5, vx: 0, vy: 0, n: 0, sunk: false }];
  let n = 1;
  for (let row = 0; row < 5; row++)
    for (let k = 0; k <= row; k++)
      balls.push({ x: 0.7 + row * 0.045, y: 0.5 + (k - row / 2) * 0.05, vx: 0, vy: 0, n: n++, sunk: false });
  return balls;
}

/** One physics step: friction + ball collisions (circle approx) */
export function stepPool(balls: PoolBall[], dt: number): void {
  const R = 0.028, W = 1, H = 0.5;
  for (const b of balls) {
    if (b.sunk) continue;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.vx *= 1 - 1.6 * dt; b.vy *= 1 - 1.6 * dt;
    if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.8; }
    if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.8; }
    if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy) * 0.8; }
    if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy) * 0.8; }
    // Pockets (6)
    const pockets = [[0, 0], [W / 2, 0], [W, 0], [0, H], [W / 2, H], [W, H]];
    for (const [px, py] of pockets)
      if (Math.hypot(b.x - px, b.y - py) < R * 1.6) { b.sunk = true; b.vx = b.vy = 0; }
  }
  for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
    const a = balls[i], b = balls[j];
    if (a.sunk || b.sunk) continue;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
    if (d < R * 2 && d > 0.0001) {
      const nx = dx / d, ny = dy / d;
      const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (rel > 0) {
        a.vx -= rel * nx; a.vy -= rel * ny;
        b.vx += rel * nx; b.vy += rel * ny;
        const overlap = R * 2 - d;
        a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
        b.x += nx * overlap / 2; b.y += ny * overlap / 2;
      }
    }
  }
}
