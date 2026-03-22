// Mirror of server mission types — kept in sync manually.
// Do not add logic here; this is a pure type module.

export type MissionWorldPhase = "idle" | "awaiting_drones" | "resolved";

export type DroneTickResponse = {
  tick: number;
  droneId: string;
  status: "ok" | "idle" | "error" | "timeout";
  intent: DroneIntent | null;
  error: string | null;
  memory: {
    lastCompletedTick: number;
  };
};

export type DroneIntent = {
  type: "idle";
};

export type MissionWorldSnapshot = {
  tick: number;
  phase: MissionWorldPhase;
  tickTimeoutMs: number;
  droneIds: string[];
  waitingOn: string[];
  responses: Record<string, DroneTickResponse>;
  readyForNextTick: boolean;
};

export type MissionDroneSnapshot = {
  droneId: string;
  playerId: string;
  script: string;
  lastRequestedTick: number;
  lastCompletedTick: number;
  lastResponseStatus: DroneTickResponse["status"];
  readyForNextTick: boolean;
};
