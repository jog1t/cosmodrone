import { actor } from "rivetkit";
import { getMissionDroneSnapshot } from "./snapshots";
import type { DroneIntent, DroneTickResponse } from "./types";

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

      const raw = c.state.script.trim();
      if (!raw) {
        c.state.lastResponseStatus = "idle";
        return {
          tick: input.tick,
          droneId: c.state.droneId,
          status: "idle",
          intent: null,
          error: null,
          memory: { lastCompletedTick: input.tick },
        };
      }

      let intent: DroneIntent = { type: "idle" };
      let error: string | null = null;
      try {
        const parsed = JSON.parse(raw) as DroneIntent;
        intent = parsed;
      } catch {
        error = "Script is not valid JSON";
      }

      c.state.lastResponseStatus = error ? "error" : "ok";
      return {
        tick: input.tick,
        droneId: c.state.droneId,
        status: error ? "error" : "ok",
        intent: error ? null : intent,
        error,
        memory: { lastCompletedTick: input.tick },
      };
    },
    getSnapshot: (c) => getMissionDroneSnapshot(c.state),
  },
});
