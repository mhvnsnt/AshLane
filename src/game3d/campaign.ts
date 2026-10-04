export type HomeFocus = "plaza" | "street" | "scaffold" | "market" | "all";
export type StageId = "ward" | "dock" | "pit" | "high" | "yard" | "under";

export type Mission = {
  n: number;
  act: number;
  actName: string;
  title: string;
  step: string;
  home: HomeFocus;
  stage: StageId;
  waves: number;
  hp: number;
  boss: boolean;
};

const ACTS: { act: number; actName: string; homes: HomeFocus[]; stage: StageId }[] = [
  { act: 1, actName: "The hire", homes: ["plaza", "street"], stage: "ward" },
  { act: 2, actName: "The roofs", homes: ["scaffold", "plaza"], stage: "high" },
  { act: 3, actName: "Night market", homes: ["market", "street"], stage: "pit" },
  { act: 4, actName: "The lease", homes: ["all", "market", "plaza"], stage: "dock" },
  { act: 5, actName: "The drop", homes: ["scaffold", "all"], stage: "high" },
  { act: 6, actName: "The pit", homes: ["market", "plaza"], stage: "pit" },
  { act: 7, actName: "The yard", homes: ["plaza", "street"], stage: "yard" },
  { act: 8, actName: "The name", homes: ["street", "market", "all"], stage: "under" },
];

const TITLES = ["Corner", "Second pack", "The bottle", "Their spot", "The gate", "The house", "Split them", "In the rain", "Last of the block", "A new name", "The next street", "Chapter end"];
const BEATS = [
  "They were waiting on the corner. Clear this pack.",
  "A second group heard the first one fall.",
  "Someone threw a bottle and stayed to swing.",
  "The block wants its spot back.",
  "Keep them off the gate.",
  "Don't let them reach the noodle house.",
  "Rook can take one. You take the rest.",
  "They fight dirtier when the rain picks up.",
  "Last group on this block.",
  "A name you have not heard yet is paying them.",
  "They brought people from the next street.",
  "End of the chapter. Finish it.",
];

export const MISSIONS: Mission[] = [];
let n = 1;
for (const act of ACTS) {
  for (let i = 0; i < 12; i++) {
    const boss = (act.act === 4 || act.act === 6 || act.act === 7) && i === 11;
    const home = boss ? "all" : act.homes[i % act.homes.length];
    MISSIONS.push({
      n,
      act: act.act,
      actName: act.actName,
      title: `${act.actName}: ${TITLES[i]}`,
      step: BEATS[i] + (home === "scaffold" ? " Jump off the coil, then hit." : ""),
      home,
      stage: act.stage,
      waves: boss ? 1 : 2 + (i % 3 === 2 ? 1 : 0),
      hp: 1 + (act.act - 1) * 0.28 + i * 0.04,
      boss,
    });
    n += 1;
  }
}

const KEY = "ashlane-campaign-v1";

export function loadCleared() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as { cleared?: number };
    const n = raw.cleared ?? 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(MISSIONS.length, n)) : 0;
  } catch {
    return 0;
  }
}

export function saveCleared(cleared: number) {
  localStorage.setItem(KEY, JSON.stringify({ cleared }));
}

export function missionAt(index: number) {
  return MISSIONS[index] ?? MISSIONS[0];
}
