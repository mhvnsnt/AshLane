/** Original job chain. The shape is a street campaign: a hire, short blocks, a partner, then one last fight. */
export const JOBS = [
  { id: "plaza", title: "Warm the plaza", step: "You were hired to quiet one block. Clear the plaza pack." },
  { id: "street", title: "Hold the scrap street", step: "The gate stays shut until that pack is down." },
  { id: "scaffold", title: "Roof the scaffolds", step: "Same hands. Springs, then the brass pylon." },
  { id: "market", title: "Night market", step: "East of the gate. A different pack." },
  { id: "lease", title: "The lease", step: "Someone comes to take the lane back. Drop them. Spin is still L." },
] as const;

export function jobNow(flags: {
  plazaClear: boolean;
  streetClear: boolean;
  scaffoldClear: boolean;
  marketClear: boolean;
  leaseDown: boolean;
}) {
  if (!flags.plazaClear) return JOBS[0];
  if (!flags.streetClear) return JOBS[1];
  if (!flags.scaffoldClear) return JOBS[2];
  if (!flags.marketClear) return JOBS[3];
  if (!flags.leaseDown) return JOBS[4];
  return { id: "hold", title: "Lane's yours", step: "The jobs are done. Walk it, or rematch the packs." };
}
