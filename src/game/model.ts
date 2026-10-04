export type Mode = "roam" | "brawl";

export type Room = {
  id: string;
  name: string;
  mode: Mode;
  rows: string[];
  doors: string[];
  npcs: { name: string; text: string }[];
  signs: string[];
};

export type Cart = {
  id: string;
  name: string;
  blurb: string;
  start: string;
  rooms: Room[];
};

export type ParseResult = { ok: true; cart: Cart } | { ok: false; error: string };

const CELL = new Set(["#", ".", "P", "N", "E", "M", "H", "C", "D", "|", "S"]);

function slug(value: string) {
  const next = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return next || "custom";
}

export function roomHostile(room: Room) {
  return room.rows.some((row) => row.includes("E") || row.includes("M"));
}

export function parseCart(source: string): ParseResult {
  const lines = source.replace(/\r/g, "").split("\n");
  let cartId = "custom";
  let title = "Custom Circuit";
  let start = "";
  let blurb = "A pocket circuit.";
  let cur: Room | null = null;
  const rooms: Room[] = [];

  const flush = () => {
    if (cur && cur.rows.length) rooms.push(cur);
    cur = null;
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("@")) {
      const body = trimmed.slice(1).trim();
      const space = body.indexOf(" ");
      const key = (space === -1 ? body : body.slice(0, space)).toLowerCase();
      const val = space === -1 ? "" : body.slice(space + 1).trim();
      if (key === "room") {
        flush();
        cur = {
          id: slug(val || `room-${rooms.length + 1}`),
          name: val || "Room",
          mode: "roam",
          rows: [],
          doors: [],
          npcs: [],
          signs: [],
        };
        continue;
      }
      if (key === "cart") {
        cartId = slug(val || cartId);
        continue;
      }
      if (key === "title") {
        title = val || title;
        continue;
      }
      if (key === "start") {
        start = slug(val);
        continue;
      }
      if (key === "blurb") {
        blurb = val || blurb;
        continue;
      }
      if (!cur) continue;
      if (key === "mode") cur.mode = val.toLowerCase() === "brawl" ? "brawl" : "roam";
      else if (key === "name") cur.name = val || cur.name;
      else if (key === "door") cur.doors.push(slug(val));
      else if (key === "npc") {
        const bar = val.indexOf("|");
        cur.npcs.push({
          name: (bar === -1 ? "Local" : val.slice(0, bar)).trim() || "Local",
          text: (bar === -1 ? val : val.slice(bar + 1)).trim() || "...",
        });
      } else if (key === "sign") cur.signs.push(val || "...");
      continue;
    }
    if (!cur) continue;
    const cells = [...trimmed];
    if (cells.length < 4 || cells.some((cell) => !CELL.has(cell))) continue;
    cur.rows.push(trimmed);
  }
  flush();

  if (!rooms.length) return { ok: false, error: "Add a @room and a grid of tiles." };
  if (rooms.length > 8) return { ok: false, error: "Keep a cartridge to 8 rooms." };

  for (const room of rooms) {
    if (room.rows.length < 5) return { ok: false, error: `${room.name} needs at least 5 rows.` };
    if (room.rows.length > 22) return { ok: false, error: `${room.name} is too tall.` };
    const width = Math.max(...room.rows.map((row) => row.length));
    if (width > 40) return { ok: false, error: `${room.name} is too wide.` };
    room.rows = room.rows.map((row) => row.padEnd(width, "#"));
    const doorCount = room.rows.join("").split("D").length - 1;
    if (doorCount !== room.doors.length) {
      return { ok: false, error: `${room.name} has ${doorCount} D doors but ${room.doors.length} @door lines.` };
    }
    const npcCount = room.rows.join("").split("N").length - 1;
    if (npcCount !== room.npcs.length) {
      return { ok: false, error: `${room.name} has ${npcCount} N tiles but ${room.npcs.length} @npc lines.` };
    }
    const signCount = room.rows.join("").split("S").length - 1;
    if (signCount !== room.signs.length) {
      return { ok: false, error: `${room.name} has ${signCount} S tiles but ${room.signs.length} @sign lines.` };
    }
    for (const door of room.doors) {
      if (!rooms.some((other) => other.id === door)) {
        return { ok: false, error: `${room.name} opens to missing room "${door}".` };
      }
    }
  }

  const ids = new Set(rooms.map((room) => room.id));
  if (ids.size !== rooms.length) return { ok: false, error: "Two rooms share an id." };
  if (!start) start = rooms[0].id;
  if (!rooms.some((room) => room.id === start)) return { ok: false, error: `Start room "${start}" is missing.` };
  const startRoom = rooms.find((room) => room.id === start)!;
  if (!startRoom.rows.some((row) => row.includes("P"))) {
    return { ok: false, error: `${startRoom.name} needs a P spawn.` };
  }

  return { ok: true, cart: { id: cartId, name: title, blurb, start, rooms } };
}

export const TILE_LEGEND: { ch: string; name: string; hint: string }[] = [
  { ch: "#", name: "Wall", hint: "Stone, fence, or the lip of the lane" },
  { ch: ".", name: "Floor", hint: "Walkable street or plaza" },
  { ch: "P", name: "Spawn", hint: "Where you drop in" },
  { ch: "N", name: "Person", hint: "Pair each N with an @npc Name|line" },
  { ch: "S", name: "Sign", hint: "Pair each S with an @sign line" },
  { ch: "E", name: "Grunt", hint: "Steps onto your line, then swings" },
  { ch: "M", name: "Bruiser", hint: "Slow, heavy, hates being launched" },
  { ch: "H", name: "Heal", hint: "A sip of scrap-tonic" },
  { ch: "C", name: "Coil", hint: "Fills the blast meter" },
  { ch: "D", name: "Door", hint: "Pair each D with an @door room-id" },
  { ch: "|", name: "Lock", hint: "A belt gate. It drops when the lane is clear" },
];
