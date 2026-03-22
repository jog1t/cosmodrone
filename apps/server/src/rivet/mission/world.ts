import { actor, event } from "rivetkit";
import type { registry } from "../actors";
import { collectDroneResponse } from "./helpers";
import { getMissionWorldSnapshot } from "./snapshots";
import {
  DEFAULT_TICK_TIMEOUT_MS,
  type DroneTickResponse,
  type MissionWorldConfig,
  type MissionWorldPhase,
  type MissionWorldSnapshot,
} from "./types";

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
  },
  actions: {
    configureWorld: (c, input: MissionWorldConfig): MissionWorldSnapshot => {
      c.state.droneIds = [...input.droneIds];
      c.state.tickTimeoutMs = input.tickTimeoutMs ?? c.state.tickTimeoutMs;
      c.state.phase = "idle";
      c.state.waitingOn = [];
      c.state.responses = {};
      c.state.tick = 0;
      const snapshot = getMissionWorldSnapshot(c.state);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    runTick: async (c): Promise<MissionWorldSnapshot> => {
      if (c.state.phase === "awaiting_drones") {
        throw new Error("World is already waiting for drone responses");
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

      const snapshot = getMissionWorldSnapshot(c.state);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    resetWorld: (c): MissionWorldSnapshot => {
      c.state.tick = 0;
      c.state.phase = "idle";
      c.state.waitingOn = [];
      c.state.responses = {};
      const snapshot = getMissionWorldSnapshot(c.state);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    getSnapshot: (c): MissionWorldSnapshot => getMissionWorldSnapshot(c.state),
  },
});
