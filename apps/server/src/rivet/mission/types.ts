export type MissionWorldPhase = "idle" | "awaiting_drones" | "resolved";

export type DroneIntent = {
  type: "idle";
};

export type DroneTickResponse = {
  tick: number;
  droneId: string;
  status: "ok" | "idle" | "error" | "timeout";
  intent: DroneIntent | null;
  logs: string[];
  error: string | null;
  memory: {
    lastCompletedTick: number;
  };
};

export type MissionPlayerState = {
  playerId: string;
  displayName: string;
  droneIds: string[];
  scripts: Record<string, string>;
};

export type MissionDroneState = {
  droneId: string;
  playerId: string;
  script: string;
  responseDelayMs: number;
  failOnTick: number | null;
  lastRequestedTick: number;
  lastCompletedTick: number;
  lastResponseStatus: DroneTickResponse["status"];
};

export type MissionWorldState = {
  tick: number;
  phase: MissionWorldPhase;
  tickTimeoutMs: number;
  droneIds: string[];
  waitingOn: string[];
  responses: Record<string, DroneTickResponse>;
};

export type MissionSystemState = {
  sessionId: string;
  playerIds: string[];
  droneIds: string[];
};

export type MissionBootstrapInput = {
  playerId: string;
  displayName: string;
  droneIds: string[];
  tickTimeoutMs?: number;
};

export type MissionPlayerSnapshot = MissionPlayerState;

export type MissionDroneSnapshot = {
  droneId: string;
  playerId: string;
  script: string;
  responseDelayMs: number;
  failOnTick: number | null;
  lastRequestedTick: number;
  lastCompletedTick: number;
  lastResponseStatus: DroneTickResponse["status"];
  readyForNextTick: boolean;
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

export type MissionSystemSnapshot = MissionSystemState;

export type MissionPlayerConfig = {
  playerId: string;
  displayName: string;
  droneIds: string[];
};

export type MissionDroneConfig = {
  droneId: string;
  playerId: string;
  script?: string;
};

export type MissionDroneBehavior = {
  responseDelayMs?: number;
  failOnTick?: number | null;
};

export type MissionWorldConfig = {
  droneIds: string[];
  tickTimeoutMs?: number;
};

export const DEFAULT_TICK_TIMEOUT_MS = 50;
