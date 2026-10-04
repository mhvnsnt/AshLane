export type Mode = "roam" | "belt" | "platform";

export type Tune = {
  moveSpeed: number;
  grapple: number;
  launcher: number;
  wallBonus: number;
  jumpV: number;
  gravity: number;
  hitstun: number;
  enemySpeed: number;
};

export const SPEC = {
  jabStartup: 0.07,
  crossStartup: 0.08,
  launchStartup: 0.11,
  active: 0.1,
  poisePlayer: 50,
  poiseGrunt: 34,
  meterCost: 45,
  dashSpeed: 14,
  jabDamage: 12,
  crossDamage: 16,
  launchDamage: 20,
  throwDamage: 14,
  enemyWindup: 0.36,
} as const;

export const DEFAULT_TUNE: Tune = {
  moveSpeed: 6.4,
  grapple: 1.75,
  launcher: 8.6,
  wallBonus: 22,
  jumpV: 9.6,
  gravity: 28,
  hitstun: 0.26,
  enemySpeed: 3.35,
};

export type Hud = {
  running: boolean;
  paused: boolean;
  mode: Mode;
  hp: number;
  maxHp: number;
  meter: number;
  poise: number;
  maxPoise: number;
  combo: number;
  foes: number;
  banner: string;
  canGrab: boolean;
  cleared: boolean;
  streetClear: boolean;
  scaffoldClear: boolean;
  plazaClear: boolean;
  tune: Tune;
};

export const EMPTY_HUD: Hud = {
  running: false,
  paused: false,
  mode: "roam",
  hp: 100,
  maxHp: 100,
  meter: 100,
  poise: SPEC.poisePlayer,
  maxPoise: SPEC.poisePlayer,
  combo: 0,
  foes: 0,
  banner: "",
  canGrab: false,
  cleared: false,
  streetClear: false,
  scaffoldClear: false,
  plazaClear: false,
  tune: DEFAULT_TUNE,
};

const STORE = "ashlane-tune-v2";

function clampNum(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function clampTune(partial: Partial<Tune>, base: Tune = DEFAULT_TUNE): Tune {
  return {
    moveSpeed: clampNum(partial.moveSpeed ?? base.moveSpeed, 3, 10, base.moveSpeed),
    grapple: clampNum(partial.grapple ?? base.grapple, 0.8, 3.2, base.grapple),
    launcher: clampNum(partial.launcher ?? base.launcher, 4, 16, base.launcher),
    wallBonus: clampNum(partial.wallBonus ?? base.wallBonus, 0, 60, base.wallBonus),
    jumpV: clampNum(partial.jumpV ?? base.jumpV, 6, 14, base.jumpV),
    gravity: clampNum(partial.gravity ?? base.gravity, 14, 42, base.gravity),
    hitstun: clampNum(partial.hitstun ?? base.hitstun, 0.12, 0.55, base.hitstun),
    enemySpeed: clampNum(partial.enemySpeed ?? base.enemySpeed, 1.4, 6.5, base.enemySpeed),
  };
}

export function loadTune(): Tune {
  if (typeof localStorage === "undefined") return { ...DEFAULT_TUNE };
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return { ...DEFAULT_TUNE };
    return clampTune(JSON.parse(raw) as Partial<Tune>);
  } catch {
    return { ...DEFAULT_TUNE };
  }
}

export function saveTune(tune: Tune) {
  try {
    localStorage.setItem(STORE, JSON.stringify(tune));
  } catch {
    /* private mode */
  }
}

export function specDocument(mode: Mode, tune: Tune) {
  const label = mode === "roam" ? "ROAM" : mode === "belt" ? "BELT" : "PLATFORM";
  return JSON.stringify(
    {
      mode: label,
      note: "Ashlane rule card. Change one number, apply, then walk the same ward.",
      tune,
      fixed: SPEC,
    },
    null,
    2,
  );
}

export function parseSpecText(raw: string): { ok: true; tune: Partial<Tune>; mode?: Mode } | { ok: false; error: string } {
  try {
    const data = JSON.parse(raw) as { mode?: string; tune?: Partial<Tune> } & Partial<Tune>;
    const src = data.tune ?? data;
    const tune: Partial<Tune> = {};
    if (src.moveSpeed != null) tune.moveSpeed = Number(src.moveSpeed);
    if (src.grapple != null) tune.grapple = Number(src.grapple);
    if (src.launcher != null) tune.launcher = Number(src.launcher);
    if (src.wallBonus != null) tune.wallBonus = Number(src.wallBonus);
    if (src.jumpV != null) tune.jumpV = Number(src.jumpV);
    if (src.gravity != null) tune.gravity = Number(src.gravity);
    if (src.hitstun != null) tune.hitstun = Number(src.hitstun);
    if (src.enemySpeed != null) tune.enemySpeed = Number(src.enemySpeed);
    let mode: Mode | undefined;
    const label = String(data.mode ?? "").toUpperCase();
    if (label === "ROAM" || label === "OMNI" || label === "FREE" || label === "PLAZA") mode = "roam";
    else if (label === "BELT" || label === "BRAWL" || label === "STREET") mode = "belt";
    else if (label === "PLATFORM" || label === "SCAFFOLD") mode = "platform";
    return { ok: true, tune, mode };
  } catch {
    return { ok: false, error: "That spec isn't valid JSON." };
  }
}
