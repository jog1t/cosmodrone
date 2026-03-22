import { actor } from "rivetkit";
import { sleep } from "./helpers";
import { getMissionDroneSnapshot } from "./snapshots";
import type { DroneTickResponse } from "./types";

export const drone = actor({
  options: {
    name: "Cosmodrone Mission Drone",
    icon: "satellite",
  },
  state: {
    droneId: "",
    playerId: "",
    script: "",
    responseDelayMs: 0,
    failOnTick: null as number | null,
    lastRequestedTick: 0,
    lastCompletedTick: 0,
    lastResponseStatus: "idle" as DroneTickResponse["status"],
  },
  onCreate(c, input: { droneId: string; playerId: string }) {
    c.state.droneId = input.droneId;
    c.state.playerId = input.playerId;
  },
  actions: {
    configureBehavior: (c, next: { responseDelayMs?: number; failOnTick?: number | null }) => {
      if (next.responseDelayMs !== undefined) {
        c.state.responseDelayMs = Math.max(0, next.responseDelayMs);
      }

      if (next.failOnTick !== undefined) {
        c.state.failOnTick = next.failOnTick;
      }

      return getMissionDroneSnapshot(c.state);
    },
    updateScript: (c, script: string) => {
      c.state.script = script;
      return getMissionDroneSnapshot(c.state);
    },
    runTick: async (c, input: { tick: number }): Promise<DroneTickResponse> => {
      c.state.lastRequestedTick = input.tick;

      if (c.state.responseDelayMs > 0) {
        await sleep(c.state.responseDelayMs);
      }

      c.state.lastCompletedTick = input.tick;

      if (c.state.failOnTick === input.tick) {
        c.state.lastResponseStatus = "error";

        return {
          tick: input.tick,
          droneId: c.state.droneId,
          status: "error",
          intent: null,
          logs: [`[${input.tick}] ${c.state.droneId} :: runtime failure`],
          error: `Drone ${c.state.droneId} failed on tick ${input.tick}`,
          memory: {
            lastCompletedTick: input.tick,
          },
        };
      }

      const isConfigured = c.state.script.trim().length > 0;
      c.state.lastResponseStatus = isConfigured ? "ok" : "idle";

      return {
        tick: input.tick,
        droneId: c.state.droneId,
        status: isConfigured ? "ok" : "idle",
        intent: isConfigured ? { type: "idle" } : null,
        logs: [`[${input.tick}] ${c.state.droneId} :: ready for next tick`],
        error: null,
        memory: {
          lastCompletedTick: input.tick,
        },
      };
    },
    getSnapshot: (c) => getMissionDroneSnapshot(c.state),
  },
});
