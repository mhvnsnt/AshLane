/**
 * AshLane Districts — adapted from Urban Mayhem's region system.
 * Original inspiration: mhvnsnt/URBAN-MAYHEM- Game/src/world.js (REGIONS)
 *
 * Urban Mayhem's REGIONS had: density, height, lot, palette, trees,
 * neon, wealth, heatBias. AshLane's 6 districts carry the same
 * systemic fields so heat, pricing, spawning and encounters can
 * key off them the same way.
 *
 * AshLane districts (from docs/OPEN_WORLD_DESIGN.md):
 *   strip, alleys, warehouses, park, subway, rooftops
 */

export interface DistrictDef {
  key: string;
  name: string;
  tag: string;
  blurb: string;
  density: number;    // 0-1 pedestrian/NPC density
  height: [number, number]; // building height range (metres)
  wealth: number;     // 0-1 (affects shop prices, circuit purses)
  trees: number;      // 0-1 foliage
  neon: number;       // 0-1 neon signage
  heatBias: number;   // multiplies heat gain (rough districts = more heat)
  gang: string;       // dominant faction key
}

export const DISTRICTS: Record<string, DistrictDef> = {
  strip: {
    key: "strip", name: "The Strip", tag: "COMMERCIAL",
    blurb: "Main commercial street. Shops, NPCs, mission hub.",
    density: 0.75, height: [8, 24], wealth: 0.65, trees: 0.10, neon: 0.80, heatBias: 1.0,
    gang: "unaffiliated",
  },
  alleys: {
    key: "alleys", name: "Back Alleys", tag: "STREET TERRITORY",
    blurb: "Narrow, ambush missions. Urban Reign-style.",
    density: 0.45, height: [4, 10], wealth: 0.30, trees: 0.05, neon: 0.30, heatBias: 1.25,
    gang: "ashes",
  },
  warehouses: {
    key: "warehouses", name: "Warehouse District", tag: "INDUSTRIAL",
    blurb: "Industrial. Boss fights, weapon missions.",
    density: 0.30, height: [6, 16], wealth: 0.40, trees: 0.05, neon: 0.15, heatBias: 1.15,
    gang: "combine",
  },
  park: {
    key: "park", name: "The Park", tag: "GREEN",
    blurb: "Grass, trees, animals (birds, stray dogs). Calm before storm.",
    density: 0.35, height: [0, 4], wealth: 0.45, trees: 0.85, neon: 0.05, heatBias: 0.7,
    gang: "civilian",
  },
  subway: {
    key: "subway", name: "Subway", tag: "UNDERGROUND",
    blurb: "Underground. Subway match type (Def Jam).",
    density: 0.55, height: [0, 6], wealth: 0.35, trees: 0.0, neon: 0.45, heatBias: 1.1,
    gang: "hollows",
  },
  rooftops: {
    key: "rooftops", name: "Rooftops", tag: "ELEVATED",
    blurb: "Connected via fire escapes. Window/ring-out missions.",
    density: 0.15, height: [12, 30], wealth: 0.55, trees: 0.02, neon: 0.55, heatBias: 0.9,
    gang: "unaffiliated",
  },
};

export const DISTRICT_KEYS = Object.keys(DISTRICTS);

/** Heat bias map for the Heat system. */
export function districtHeatBias(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of DISTRICT_KEYS) out[k] = DISTRICTS[k].heatBias;
  return out;
}

/** Dominant gang per district (for spawning). */
export function gangForDistrict(district: string): string {
  return DISTRICTS[district]?.gang ?? "civilian";
}
