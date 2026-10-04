/** Street-brawler loop. Structure only: walk a block, commit, string, scrap, clear. */
export const PIPELINE = [
  { id: "walk", title: "Walk", step: "Packs stay on their block until you step in." },
  { id: "commit", title: "Commit", step: "Scuffle is on. It stays until this block is quiet." },
  { id: "string", title: "String", step: "Three hits. The third launches. Hold down and hit to sweep." },
  { id: "scrap", title: "Scrap", step: "Grab, throw them into a wall, or dash through a swing. Weapons break." },
  { id: "clear", title: "Clear", step: "Block's quiet. Walk to the next one." },
] as const;

export type PhaseId = (typeof PIPELINE)[number]["id"];

export function phaseCopy(id: PhaseId) {
  return PIPELINE.find((row) => row.id === id) ?? PIPELINE[0];
}

export function resolvePhase(opts: { scuffle: boolean; weapon: "fist" | "pipe" | "bottle"; combo: number; canGrab: boolean }): PhaseId {
  if (!opts.scuffle) return "walk";
  if (opts.canGrab || opts.weapon !== "fist") return "scrap";
  if (opts.combo >= 2) return "string";
  return "commit";
}
