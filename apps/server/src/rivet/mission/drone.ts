import { actor } from "rivetkit";
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
    lastRequestedTick: 0,
    lastCompletedTick: 0,
    lastResponseStatus: "idle" as DroneTickResponse["status"],
  },
  onCreate(c, input: { droneId: string; playerId: string }) {
    c.state.droneId = input.droneId;
    c.state.playerId = input.playerId;
  },
  actions: {
    updateScript: (c, script: string) => {
      c.state.script = script;
      return getMissionDroneSnapshot(c.state);
    },
    runTick: (c, input: { tick: number }): DroneTickResponse => {
      c.state.lastRequestedTick = input.tick;
      c.state.lastCompletedTick = input.tick;

      const isConfigured = c.state.script.trim().length > 0;
      c.state.lastResponseStatus = isConfigured ? "ok" : "idle";

      return {
        tick: input.tick,
        droneId: c.state.droneId,
        status: isConfigured ? "ok" : "idle",
        intent: isConfigured ? { type: "idle" } : null,
        error: null,
        memory: {
          lastCompletedTick: input.tick,
        },
      };
    },
    getSnapshot: (c) => getMissionDroneSnapshot(c.state),
  },
});
