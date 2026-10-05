/**
 * Federated district streaming for AshLane's connected open world.
 *
 * Inspiration (patterns, original implementation):
 *  - fiercefairy/openworld: chunked streaming, 2-level LOD.
 *  - carladevv/r3fchunkedenvironment: memory-aware disposal, LOD switching.
 *  - croissantsam/openworldcar: chunk state machine
 *    (requested -> loading -> loaded -> active -> unloading -> unloaded).
 *  - wdh815/maptest: per-layer streaming radii, SimClock.
 *  - jason9075/dtm-visualizer: frustum-cull-by-chunk, Draco compression.
 *
 * Districts stream in/out as the player travels — no loading screens
 * between the 6 connected zones.
 */

export type ChunkState =
  | "unloaded" | "requested" | "loading" | "loaded" | "active" | "unloading";

export interface DistrictChunk {
  id: string;
  /** district this chunk belongs to */
  district: string;
  /** chunk center */
  x: number; z: number;
  /** half-size */
  half: number;
  state: ChunkState;
  /** 0 = full, 1 = low (distance LOD) */
  lod: 0 | 1;
  /** ref count of active entities inside */
  refs: number;
}

export interface StreamConfig {
  /** beyond this, chunks unload */
  unloadRadius: number;
  /** within this, chunks become active */
  activeRadius: number;
  /** LOD switch distance */
  lodDistance: number;
}

export const DEFAULT_STREAM: StreamConfig = {
  unloadRadius: 220,
  activeRadius: 120,
  lodDistance: 90,
};

export function createChunk(id: string, district: string, x: number, z: number, half: number): DistrictChunk {
  return { id, district, x, z, half, state: "unloaded", lod: 1, refs: 0 };
}

export interface StreamSystem {
  chunks: Map<string, DistrictChunk>;
  config: StreamConfig;
  /** ids the loader should fetch this frame */
  loadQueue: string[];
  /** ids the renderer should drop this frame */
  unloadQueue: string[];
}

export function createStreamSystem(config = DEFAULT_STREAM): StreamSystem {
  return { chunks: new Map(), config, loadQueue: [], unloadQueue: [] };
}

export function updateStreaming(s: StreamSystem, px: number, pz: number): void {
  s.loadQueue.length = 0;
  s.unloadQueue.length = 0;
  const { unloadRadius, activeRadius, lodDistance } = s.config;

  for (const c of s.chunks.values()) {
    const d = Math.hypot(c.x - px, c.z - pz);

    // LOD
    c.lod = d > lodDistance ? 1 : 0;

    switch (c.state) {
      case "unloaded":
        if (d < unloadRadius) { c.state = "requested"; s.loadQueue.push(c.id); }
        break;
      case "requested":
        // loader picks these up; sim marks loading when fetch starts
        break;
      case "loaded":
        if (d < activeRadius) c.state = "active";
        else if (d > unloadRadius) { c.state = "unloading"; s.unloadQueue.push(c.id); }
        break;
      case "active":
        if (d > activeRadius && c.refs === 0) c.state = "loaded";
        break;
      case "unloading":
        // renderer drops; loader marks unloaded when done
        break;
      case "loading":
        break;
    }
  }
}

/** Loader reports a chunk fetch finished */
export function chunkLoaded(s: StreamSystem, id: string): void {
  const c = s.chunks.get(id);
  if (c && c.state === "loading") c.state = "loaded";
}

/** Loader reports a chunk fetch started */
export function chunkLoading(s: StreamSystem, id: string): void {
  const c = s.chunks.get(id);
  if (c && c.state === "requested") c.state = "loading";
}

/** Renderer reports a chunk dropped */
export function chunkUnloaded(s: StreamSystem, id: string): void {
  const c = s.chunks.get(id);
  if (c && c.state === "unloading") c.state = "unloaded";
}

/** SimClock: decouples sim time from wall time (maptest pattern) */
export interface SimClock {
  t: number;
  scale: number;
  paused: boolean;
}

export function createSimClock(): SimClock {
  return { t: 0, scale: 1, paused: false };
}

export function tickClock(c: SimClock, wallDt: number): number {
  if (c.paused) return 0;
  const dt = wallDt * c.scale;
  c.t += dt;
  return dt;
}
