/**
 * city-seed.js — Seeded open-world district layout generator for AshLane.
 *
 * Generates a deterministic city plan from a seed: blocks, streets,
 * building footprints, alley placement, prop scatter points, and
 * graffiti spots. Output is JSON the engine loads to place real assets.
 *
 * The city is Yakuza-style: ONE dense district, all connected, no
 * loading between streets. Districts from OPEN_WORLD_DESIGN.md:
 *   strip, alleys, warehouses, park, subway, rooftops
 *
 * Usage:
 *   import { generateCity } from './city-seed.js';
 *   const city = generateCity({ seed: 'ashlane-01' });
 *   fs.writeFileSync('city.json', JSON.stringify(city, null, 2));
 */
import { rng } from "./rng.js";

const DISTRICTS = [
  { id: "strip",      name: "The Strip",        kind: "commercial" },
  { id: "alleys",     name: "Back Alleys",      kind: "alley" },
  { id: "warehouses", name: "Warehouse Row",    kind: "industrial" },
  { id: "park",       name: "Meridian Park",    kind: "park" },
  { id: "subway",     name: "Grand Station",    kind: "transit" },
  { id: "rooftops",   name: "Rooftop Run",      kind: "vertical" },
];

/**
 * Generate the full city plan.
 * @param {object} opts { seed, blockSize, blocksX, blocksZ }
 */
export function generateCity({ seed = "ashlane-01", blockSize = 60, blocksX = 5, blocksZ = 5 } = {}) {
  const R = rng(seed);
  const W = blocksX * blockSize;
  const D = blocksZ * blockSize;

  const blocks = [];
  for (let bx = 0; bx < blocksX; bx++) {
    for (let bz = 0; bz < blocksZ; bz++) {
      blocks.push(generateBlock(R, bx, bz, blockSize, W, D));
    }
  }

  // streets run between blocks (grid)
  const streets = [];
  for (let i = 0; i <= blocksX; i++) {
    streets.push({ id: `st-v${i}`, axis: "z", at: i * blockSize, from: 0, to: D, width: 10 });
  }
  for (let i = 0; i <= blocksZ; i++) {
    streets.push({ id: `st-h${i}`, axis: "x", at: i * blockSize, from: 0, to: W, width: 10 });
  }

  // mission markers: pick notable spots
  const markers = generateMarkers(R, blocks, blockSize);

  // fast-travel taxi stands (Yakuza rule: discover on foot first)
  const taxis = [
    { id: "taxi-strip", block: "2,2", discovered: false },
    { id: "taxi-ware", block: "4,1", discovered: false },
    { id: "taxi-park", block: "1,4", discovered: false },
  ];

  // notice boards (Witcher-style job sources)
  const boards = [
    { id: "board-strip", block: "2,2" },
    { id: "board-alleys", block: "3,3" },
  ];

  return {
    seed: String(seed),
    size: { w: W, d: D, blockSize },
    districts: DISTRICTS,
    blocks,
    streets,
    markers,
    taxis,
    boards,
    stats: {
      buildings: blocks.reduce((n, b) => n + b.buildings.length, 0),
      alleys: blocks.filter((b) => b.alley).length,
      graffitiSpots: blocks.reduce((n, b) => n + b.graffiti.length, 0),
      props: blocks.reduce((n, b) => n + b.props.length, 0),
    },
  };
}

function generateBlock(R, bx, bz, size, W, D) {
  const cx = bx * size + size / 2;
  const cz = bz * size + size / 2;
  const key = `${bx},${bz}`;

  // district assignment: center = strip, edges vary
  const distFromCenter = Math.max(Math.abs(bx - 2), Math.abs(bz - 2));
  let district = "strip";
  if (distFromCenter >= 2) district = R.pick(["warehouses", "park", "alleys"]);
  else if (distFromCenter === 1) district = R.pick(["strip", "alleys", "strip"]);

  const block = {
    key, cx, cz, district,
    buildings: [],
    alley: false,
    graffiti: [],
    props: [],
    park: null,
  };

  if (district === "park") {
    // park block: grass, trees, paths, animals; thugs at night
    const treeCount = R.int(6, 12);
    const trees = [];
    for (let i = 0; i < treeCount; i++) {
      trees.push({
        x: +(cx + R.range(-size / 2 + 6, size / 2 - 6)).toFixed(1),
        z: +(cz + R.range(-size / 2 + 6, size / 2 - 6)).toFixed(1),
        s: +R.range(0.8, 1.4).toFixed(2),
      });
    }
    block.park = {
      trees,
      grassPatches: R.int(4, 8),
      // animals by day, thugs by night
      animals: R.pickN(["pigeons", "stray_dog", "squirrels", "crows"], R.int(1, 3)),
      nightSpawn: "thugs",
      benches: R.int(2, 4),
    };
    // small kiosk building
    block.buildings.push({
      x: cx, z: cz + size / 4, w: 8, d: 6, h: 4,
      style: "kiosk", floors: 1,
    });
  } else {
    // building block: 1-4 buildings with setbacks
    const n = R.int(2, 4);
    const slots = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    const chosen = R.shuffle(slots).slice(0, n);
    for (const [sx, sz] of chosen) {
      const bw = R.range(14, 22), bd = R.range(14, 22);
      block.buildings.push({
        x: +(cx + sx * (size / 4 + R.range(-3, 3))).toFixed(1),
        z: +(cz + sz * (size / 4 + R.range(-3, 3))).toFixed(1),
        w: +bw.toFixed(1),
        d: +bd.toFixed(1),
        h: +(R.range(12, district === "warehouses" ? 20 : 48)).toFixed(1),
        style: R.pick(district === "warehouses"
          ? ["warehouse", "warehouse", "factory"]
          : ["brick", "concrete", "storefront", "brick"]),
        floors: R.int(2, 8),
        rooftopAccess: R.chance(0.4), // fire-escape → rooftop district link
      });
    }
    // alleys between buildings
    if (R.chance(0.55)) {
      block.alley = true;
      block.alleyPath = {
        from: { x: +(cx - size / 2).toFixed(1), z: +cz.toFixed(1) },
        to: { x: +(cx + size / 2).toFixed(1), z: +cz.toFixed(1) },
        width: +R.range(3, 5).toFixed(1),
      };
    }
  }

  // graffiti spots: on building walls facing streets/alleys
  const gCount = R.int(2, district === "alleys" ? 8 : 5);
  for (let i = 0; i < gCount; i++) {
    block.graffiti.push({
      x: +(cx + R.range(-size / 2, size / 2)).toFixed(1),
      z: +(cz + R.range(-size / 2, size / 2)).toFixed(1),
      wall: R.pick(["n", "s", "e", "w"]),
      seed: R.int(1, 99999),
      style: R.pick(["tag", "tag", "throwup", "piece"]),
    });
  }

  // props: dumpsters, crates, barrels, pallets (breakables), lamps
  const propKinds = district === "warehouses"
    ? ["dumpster", "crate", "barrel", "pallet", "forklift"]
    : ["dumpster", "crate", "barrel", "trashbag", "lamp", "bench", "hydrant"];
  const pCount = R.int(4, 9);
  for (let i = 0; i < pCount; i++) {
    const kind = R.pick(propKinds);
    block.props.push({
      kind,
      x: +(cx + R.range(-size / 2 + 4, size / 2 - 4)).toFixed(1),
      z: +(cz + R.range(-size / 2 + 4, size / 2 - 4)).toFixed(1),
      rot: +R.range(0, Math.PI * 2).toFixed(2),
      breakable: ["crate", "barrel", "trashbag", "pallet"].includes(kind),
      hp: ["crate", "pallet"].includes(kind) ? 2 : ["barrel", "trashbag"].includes(kind) ? 1 : 99,
    });
  }

  return block;
}

function generateMarkers(R, blocks, blockSize) {
  // story markers: fixed narrative beats at notable blocks
  const story = [
    { id: "m01", kind: "story", label: "The Arrival", block: "2,2", icon: "!" },
    { id: "m02", kind: "story", label: "First Blood", block: "3,2", icon: "!" },
    { id: "m03", kind: "story", label: "Warehouse Raid", block: "4,1", icon: "!" },
  ];
  // side "?" markers (GTA Strangers & Freaks style)
  const sides = [];
  const sideBlocks = R.shuffle(blocks.map((b) => b.key)).slice(0, 8);
  const sideNames = ["Debt Collector", "Lost Dog", "Underground Fight", "Stolen Bike",
    "Informant", "Protection Racket", "Midnight Race", "The Cook"];
  sideBlocks.forEach((bk, i) => {
    sides.push({
      id: `side-${String(i + 1).padStart(2, "0")}`,
      kind: "side", icon: "?",
      label: sideNames[i % sideNames.length],
      block: bk,
      parts: R.int(1, 4), // multi-part chains
    });
  });
  // shops
  const shops = [
    { id: "shop-clothes", kind: "shop", label: "Threadz", block: "2,3", sells: ["clothes"] },
    { id: "shop-weapons", kind: "shop", label: "Hardware", block: "4,2", sells: ["weapons"] },
    { id: "shop-food", kind: "shop", label: "Diner", block: "1,2", sells: ["food"] },
  ];
  return [...story, ...sides, ...shops];
}

/** Pretty-print a city plan as ASCII map for quick review. */
export function asciiMap(city) {
  const { blocksX = 5, blocksZ = 5 } = {};
  const bx = 5, bz = 5;
  const grid = Array.from({ length: bz }, () => Array(bx).fill("·"));
  const glyph = { strip: "S", alleys: "A", warehouses: "W", park: "P", subway: "T", rooftops: "R" };
  for (const b of city.blocks) {
    const [x, z] = b.key.split(",").map(Number);
    grid[z][x] = glyph[b.district] || "?";
  }
  return grid.map((row) => row.join(" ")).join("\n") +
    "\nS=strip A=alleys W=warehouses P=park T=subway R=rooftops";
}

export { DISTRICTS };
