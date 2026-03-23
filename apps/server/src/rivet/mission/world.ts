import { UserError, actor, event } from "rivetkit";
import type { registry } from "../actors";
import { collectDroneResponse } from "./helpers";
import { getMissionWorldSnapshot } from "./snapshots";
import {
  DEFAULT_TICK_TIMEOUT_MS,
  type DroneTickResponse,
  type DroneWorldState,
  type EntityVisibility,
  type MissionWorldPhase,
  type MissionWorldSnapshot,
  type MissionWorldState,
} from "./types";

// Ore node positions in normalised 0..1 space — must match ORE_REL in MapPixiScene.tsx
const ORE_REL = [
  { rx: 0.62, ry: 0.28 },
  { rx: 0.55, ry: 0.38 },
  { rx: 0.68, ry: 0.44 },
  { rx: 0.48, ry: 0.5 },
];

// Sense radius as a fraction of the map's normalised space (0..1)
const SENSE_RADIUS_NORM = 0.06;

// Initial drone positions — canvas reads these back from the snapshot
const INITIAL_DRONES: DroneWorldState[] = [
  { droneId: "M1", position: { x: 0.32, y: 0.62 }, senseRadius: SENSE_RADIUS_NORM },
  { droneId: "H1", position: { x: 0.44, y: 0.52 }, senseRadius: SENSE_RADIUS_NORM },
  { droneId: "S1", position: { x: 0.55, y: 0.42 }, senseRadius: SENSE_RADIUS_NORM },
];

const DEPOSIT_ID = "ore_cluster_a1";

// Max distance a drone can travel per tick, in normalised units
const MAX_SPEED = 0.05;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function applyIntents(state: MissionWorldState): void {
  for (const droneId of state.droneIds) {
    const response = state.responses[droneId];
    const drone = state.drones[droneId];
    if (!response || !drone || response.intent?.type !== "move") continue;

    const target = response.intent.target;
    const dx = target.x - drone.position.x;
    const dy = target.y - drone.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.001) continue; // already there

    // Move at most MAX_SPEED per tick toward target
    const step = Math.min(dist, MAX_SPEED) / dist;
    drone.position = {
      x: clamp(drone.position.x + dx * step, 0, 1),
      y: clamp(drone.position.y + dy * step, 0, 1),
    };
  }
}

function computeVisibility(state: MissionWorldState): MissionWorldState["visibility"] {
  const droneList = Object.values(state.drones);
  const prevNodes: EntityVisibility[] = state.visibility.deposits[DEPOSIT_ID]?.nodes ?? [];

  const nodes: EntityVisibility[] = ORE_REL.map((ore, i) => {
    const inSense = droneList.some((d) => {
      const dx = d.position.x - ore.rx;
      const dy = d.position.y - ore.ry;
      return Math.sqrt(dx * dx + dy * dy) <= d.senseRadius;
    });

    if (inSense) return "sense";
    // Persist memory: once seen, never return to fog
    if (prevNodes[i] === "sense" || prevNodes[i] === "memory") return "memory";
    return "fog";
  });

  return { deposits: { [DEPOSIT_ID]: { nodes } } };
}

export const world = actor({
  options: {
    name: "Cosmodrone Mission World",
    icon: "globe",
  },
  events: {
    snapshot: event<MissionWorldSnapshot>(),
  },
  state: {
    tick: 0,
    phase: "idle" as MissionWorldPhase,
    tickTimeoutMs: DEFAULT_TICK_TIMEOUT_MS,
    droneIds: [] as string[],
    waitingOn: [] as string[],
    responses: {} as Record<string, DroneTickResponse>,
    drones: Object.fromEntries(INITIAL_DRONES.map((d) => [d.droneId, d])) as Record<
      string,
      DroneWorldState
    >,
    visibility: {
      deposits: {} as Record<string, { nodes: EntityVisibility[] }>,
    },
  },
  onCreate(c, input: { droneIds: string[]; tickTimeoutMs?: number }) {
    c.state.droneIds = [...input.droneIds];
    c.state.tickTimeoutMs = input.tickTimeoutMs ?? DEFAULT_TICK_TIMEOUT_MS;
  },
  actions: {
    runTick: async (c): Promise<MissionWorldSnapshot> => {
      if (c.state.phase === "awaiting_drones") {
        throw new UserError("World is already waiting for drone responses");
      }

      const nextTick = c.state.tick + 1;
      const sessionId = String(c.key[0] ?? "sandbox");
      const client = c.client<typeof registry>();

      c.state.phase = "awaiting_drones";
      c.state.waitingOn = [...c.state.droneIds];
      c.state.responses = {};

      await Promise.all(
        c.state.droneIds.map(async (droneId) => {
          const response = await collectDroneResponse(
            client,
            sessionId,
            droneId,
            nextTick,
            c.state.tickTimeoutMs,
          );

          c.state.responses[droneId] = response;
          c.state.waitingOn = c.state.waitingOn.filter((pendingId) => pendingId !== droneId);
        }),
      );

      c.state.tick = nextTick;
      c.state.phase = "resolved";
      applyIntents(c.state);
      c.state.visibility = computeVisibility(c.state);

      const snapshot = getMissionWorldSnapshot(c.state);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    resetWorld: (c, input?: { droneIds?: string[] }): MissionWorldSnapshot => {
      c.state.tick = 0;
      c.state.phase = "idle";
      c.state.waitingOn = [];
      c.state.responses = {};
      c.state.visibility = { deposits: {} };
      if (input?.droneIds) {
        c.state.droneIds = [...input.droneIds];
        // Reset drone positions to initial values for known drone IDs
        const known: Record<string, DroneWorldState> = Object.fromEntries(
          INITIAL_DRONES.map((d) => [d.droneId, { ...d }]),
        );
        c.state.drones = {};
        for (const droneId of input.droneIds) {
          c.state.drones[droneId] = known[droneId] ?? {
            droneId,
            position: { x: 0.5, y: 0.5 },
            senseRadius: SENSE_RADIUS_NORM,
          };
        }
      }
      const snapshot = getMissionWorldSnapshot(c.state);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    getSnapshot: (c): MissionWorldSnapshot => getMissionWorldSnapshot(c.state),
  },
});
