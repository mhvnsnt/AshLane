export type HomeFocus = "plaza" | "street" | "scaffold" | "market" | "yard" | "dock" | "under" | "ring" | "cage" | "subway" | "crane" | "office";
export type StageId = "ward" | "dock" | "pit" | "high" | "yard" | "under";
export type Rule = "clear" | "rival" | "inside" | "reach" | "second";

export type Mission = {
  n: number;
  act: number;
  actName: string;
  title: string;
  step: string;
  home: HomeFocus;
  drop: HomeFocus;
  stage: StageId;
  waves: number;
  hp: number;
  boss: boolean;
  rule: Rule;
};

const RAW: Omit<Mission, "n">[] = [
  { act: 1, actName: "The hire", title: "Warm the corner", step: "You were paid for the plaza. The people standing there are the job. Nobody else is coming.", home: "plaza", drop: "plaza", stage: "ward", waves: 1, hp: 1, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Scrap street", step: "The next pay is south of the plaza. You start on the scrap street, not back at the corner.", home: "street", drop: "street", stage: "ward", waves: 1, hp: 1, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Night sellers", step: "The market hired its own hands. You come in from the stalls.", home: "market", drop: "market", stage: "pit", waves: 1, hp: 1.05, boss: false, rule: "clear" },
  { act: 1, actName: "The hire", title: "Walk the lane", step: "Start at the corner. The fight is on the scrap street. Get there, then finish who is standing.", home: "street", drop: "plaza", stage: "ward", waves: 1, hp: 1.05, boss: false, rule: "reach" },
  { act: 2, actName: "High", title: "The coil", step: "They moved the stash onto the scaffolds. You start on the roofs.", home: "scaffold", drop: "scaffold", stage: "high", waves: 1, hp: 1.15, boss: false, rule: "clear" },
  { act: 2, actName: "High", title: "North roof", step: "The crane roof is the job. Climb is already behind you. You start at the top.", home: "crane", drop: "crane", stage: "high", waves: 1, hp: 1.2, boss: false, rule: "clear" },
  { act: 2, actName: "High", title: "Up the steps", step: "Start on the coil. The name you want is on the north roof. Walk it.", home: "crane", drop: "scaffold", stage: "high", waves: 1, hp: 1.2, boss: false, rule: "reach" },
  { act: 2, actName: "High", title: "One on the coil", step: "One fighter. The roof is the ring. No second crew.", home: "scaffold", drop: "scaffold", stage: "high", waves: 1, hp: 1.35, boss: true, rule: "rival" },
  { act: 3, actName: "Rooms", title: "The ropes", step: "East of the pier. The red ropes hold the fight. You start inside them.", home: "ring", drop: "ring", stage: "yard", waves: 1, hp: 1.25, boss: false, rule: "inside" },
  { act: 3, actName: "Rooms", title: "The grate", step: "West cage. You start in the mesh. Throw them into it.", home: "cage", drop: "cage", stage: "yard", waves: 1, hp: 1.3, boss: false, rule: "inside" },
  { act: 3, actName: "Rooms", title: "The paper", step: "The back room past the market. One name keeps the paper.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.45, boss: true, rule: "rival" },
  { act: 3, actName: "Rooms", title: "Through the gap", step: "Start in the market. The room is through the east gap. Finish it there.", home: "office", drop: "market", stage: "pit", waves: 1, hp: 1.3, boss: false, rule: "reach" },
  { act: 4, actName: "Under", title: "The cut", step: "Under the ward. You start in the cut, not on the plaza.", home: "under", drop: "under", stage: "under", waves: 1, hp: 1.35, boss: false, rule: "clear" },
  { act: 4, actName: "Under", title: "The train", step: "South tunnel. You start on the platform. Stay off the track.", home: "subway", drop: "subway", stage: "under", waves: 1, hp: 1.4, boss: false, rule: "clear" },
  { act: 4, actName: "Under", title: "South", step: "Start in the cut. The platform is further south. The fight is there.", home: "subway", drop: "under", stage: "under", waves: 1, hp: 1.4, boss: false, rule: "reach" },
  { act: 4, actName: "Under", title: "One on the platform", step: "One fighter in the tunnel. The train still runs.", home: "subway", drop: "subway", stage: "under", waves: 1, hp: 1.55, boss: true, rule: "rival" },
  { act: 5, actName: "Ends", title: "The trucks", step: "The yard. You start between the trucks.", home: "yard", drop: "yard", stage: "yard", waves: 1, hp: 1.45, boss: false, rule: "clear" },
  { act: 5, actName: "Ends", title: "The pier", step: "The pier does not wait. You start on the water side.", home: "dock", drop: "dock", stage: "dock", waves: 1, hp: 1.5, boss: false, rule: "clear" },
  { act: 5, actName: "Ends", title: "They come back", step: "The only job that sends a second crew. Beat the pier, then the ones who fell back.", home: "dock", drop: "dock", stage: "dock", waves: 2, hp: 1.45, boss: false, rule: "second" },
  { act: 5, actName: "Ends", title: "The pier name", step: "One heavier fighter on the pier. The block hears who won.", home: "dock", drop: "dock", stage: "dock", waves: 1, hp: 1.7, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "West name", step: "One name in the cage. You start inside the grate.", home: "cage", drop: "cage", stage: "yard", waves: 1, hp: 1.7, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "Back on the ropes", step: "The ring again, later, with heavier hands. Still one fight.", home: "ring", drop: "ring", stage: "yard", waves: 1, hp: 1.6, boss: false, rule: "inside" },
  { act: 6, actName: "Both ends", title: "The room holds", step: "Back room. The door is the boundary. You start at the desk.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.65, boss: false, rule: "inside" },
  { act: 6, actName: "Both ends", title: "The drop", step: "One name on the crane roof. A fall is part of the fight.", home: "crane", drop: "crane", stage: "high", waves: 1, hp: 1.75, boss: true, rule: "rival" },
  { act: 6, actName: "Both ends", title: "Across the ward", step: "Start in the yard. The pier is the job. Cross it, then finish them.", home: "dock", drop: "yard", stage: "dock", waves: 1, hp: 1.6, boss: false, rule: "reach" },
  { act: 6, actName: "Both ends", title: "Paper Quinn", step: "The last paper. You start in the back room. One name.", home: "office", drop: "office", stage: "pit", waves: 1, hp: 1.9, boss: true, rule: "rival" },
];

export const MISSIONS: Mission[] = RAW.map((job, i) => ({ ...job, n: i + 1 }));

const KEY = "ashlane-campaign-v2";

export function placeName(home: HomeFocus) {
  if (home === "street") return "Scrap street";
  if (home === "scaffold") return "Coil roofs";
  if (home === "market") return "Night market";
  if (home === "yard") return "The yard";
  if (home === "dock") return "The pier";
  if (home === "under") return "Under the ward";
  if (home === "ring") return "The ring";
  if (home === "cage") return "The cage";
  if (home === "subway") return "The platform";
  if (home === "crane") return "The crane roof";
  if (home === "office") return "The back room";
  return "Cinder plaza";
}

export function ruleLabel(rule: Rule) {
  if (rule === "rival") return "One name";
  if (rule === "inside") return "The room holds you";
  if (rule === "reach") return "Walk there, then finish it";
  if (rule === "second") return "They send one more crew";
  return "The people already standing";
}

export function loadCleared() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as { cleared?: number };
    const n = raw.cleared ?? 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(MISSIONS.length, n)) : 0;
  } catch {
    return 0;
  }
}

export function loadPurse() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as { purse?: number };
    const n = raw.purse ?? 0;
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  } catch {
    return 0;
  }
}

export function loadXp() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as { xp?: number };
    const n = raw.xp ?? 0;
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  } catch {
    return 0;
  }
}

export function saveCleared(cleared: number, purse = 0, xp = 0) {
  localStorage.setItem(KEY, JSON.stringify({ cleared, purse, xp }));
}

export function missionAt(index: number) {
  return MISSIONS[index] ?? MISSIONS[0];
}
