import type { Arch } from "./sim";

export type WardFighter = {
  id: string;
  name: string;
  home: import("./sim").Home;
  arch: Arch;
  style: string;
  line: string;
};

export const LEASE_NAME = "Paper Quinn";

export const WARD: WardFighter[] = [
  { id: "soot", name: "Soot Calder", home: "plaza", arch: "hood", style: "pocket elbows", line: "First name on the plaza. Short work, close in." },
  { id: "moth", name: "Moth Ibarra", home: "plaza", arch: "runner", style: "in and out", line: "Leaves as soon as the hit lands." },
  { id: "kiln", name: "Kiln Duarte", home: "plaza", arch: "brute", style: "heavy hands", line: "The weight in the first pack." },
  { id: "vesper", name: "Vesper Cho", home: "plaza", arch: "hex", style: "odd angles", line: "Does not stand where you aimed." },
  { id: "latch", name: "Latch Okonkwo", home: "plaza", arch: "brawler", style: "straight pressure", line: "Walks in and does not give the step back." },
  { id: "piton", name: "Piton Reyes", home: "street", arch: "brawler", style: "long guard", line: "Holds the scrap street with the lead hand." },
  { id: "nim", name: "Nim Sato", home: "street", arch: "runner", style: "low line", line: "Lives under the punches." },
  { id: "hark", name: "Hark Bell", home: "street", arch: "hex", style: "counters", line: "Waits, then answers." },
  { id: "cinder", name: "Cinder Walsh", home: "street", arch: "brute", style: "shoulder first", line: "Clears space with the body." },
  { id: "ashen", name: "Ashen Pike", home: "scaffold", arch: "hood", style: "roof kicks", line: "Fights where the fall is the weapon." },
  { id: "bolt", name: "Bolt Ndiaye", home: "scaffold", arch: "brute", style: "drops", line: "Comes off the coil hard." },
  { id: "wren", name: "Wren Pell", home: "market", arch: "hex", style: "close and ugly", line: "Night market hands. Nothing pretty." },
  { id: "sable", name: "Sable Ortiz", home: "market", arch: "runner", style: "cuts the lane", line: "Uses the stalls." },
  { id: "gutter", name: "Gutter Ames", home: "market", arch: "hood", style: "bottle hands", line: "Will pick up whatever is on the table." },
  { id: "rasp", name: "Rasp Kovac", home: "yard", arch: "brute", style: "yard weight", line: "Works between the trucks." },
  { id: "flick", name: "Flick Danjuma", home: "yard", arch: "runner", style: "around the trucks", line: "Does not stand in the open." },
  { id: "hopper", name: "Hopper Lin", home: "yard", arch: "hood", style: "short hooks", line: "Stays in the pocket." },
  { id: "brine", name: "Brine Callahan", home: "dock", arch: "hex", style: "pier knees", line: "The pier is the ring." },
  { id: "hull", name: "Hull Ortega", home: "dock", arch: "brute", style: "anchor", line: "Does not get moved." },
  { id: "low", name: "Low Marrow", home: "under", arch: "brawler", style: "stays low", line: "Soot's kin. Learned it under the street." },
  { id: "drain", name: "Drain Peck", home: "under", arch: "hood", style: "dark elbows", line: "The underpass does not get brighter for a fight." },
  { id: "culvert", name: "Culvert Singh", home: "under", arch: "runner", style: "under the street", line: "Knows which wall is a door." },
  { id: "canvas", name: "Canvas Reed", home: "ring", arch: "brawler", style: "off the ropes", line: "Lives in the ring east of the pier." },
  { id: "aprons", name: "Apron Voss", home: "ring", arch: "hood", style: "rope run", line: "Uses the bounce." },
  { id: "mesh", name: "Mesh Calder", home: "cage", arch: "brute", style: "cage weight", line: "The west cage. Does not leave it." },
  { id: "grate", name: "Grate Pell", home: "cage", arch: "brawler", style: "into the mesh", line: "Throws you at the grate." },
  { id: "thirdrail", name: "Third Rail", home: "subway", arch: "runner", style: "off the platform", line: "South tunnel. Do not stand on the track." },
  { id: "token", name: "Token Ames", home: "subway", arch: "hood", style: "turnstile", line: "Fights in the narrow." },
  { id: "highbeam", name: "High Beam", home: "crane", arch: "hex", style: "the drop", line: "North roof. The edge is the move." },
  { id: "ledger", name: "Ledger Cho", home: "office", arch: "hex", style: "back room", line: "Keeps the paper past the market." },
];

export const PARTNER = { name: "Rook Calder", style: "comes in after the plaza", line: "Not from the other book. Ash Lane's second." };

const taken = new Set<string>();

export function resetWard() {
  taken.clear();
}

export function claimWard(home: import("./sim").Home, arch: Arch) {
  const mine = WARD.find((f) => f.home === home && f.arch === arch && !taken.has(f.id));
  const spare = mine ?? WARD.find((f) => f.arch === arch && !taken.has(f.id)) ?? WARD.find((f) => !taken.has(f.id)) ?? WARD[0];
  taken.add(spare.id);
  return spare;
}

export function wardByName(name: string) {
  return WARD.find((f) => f.name === name) ?? null;
}
