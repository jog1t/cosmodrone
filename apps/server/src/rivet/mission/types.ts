export type MissionWorldPhase = "idle" | "awaiting_drones" | "resolved";

export type Vec2 = { x: number; y: number };

export type DroneIntent =
  | { type: "idle" }
  | { type: "move"; target: Vec2 } // normalised 0..1 target position
  | { type: "mine" }; // stay in place and extract ore

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

export type MissionPlayerState = {
  playerId: string;
  displayName: string;
  droneIds: string[];
};

export type MissionDroneState = {
  droneId: string;
  playerId: string;
  script: string;
  lastRequestedTick: number;
  lastCompletedTick: number;
  lastResponseStatus: DroneTickResponse["status"];
};

export type EntityVisibility = "sense" | "memory" | "fog";

export type DroneWorldState = {
  droneId: string;
  position: Vec2; // normalised 0..1 relative to canvas
  senseRadius: number; // in normalised units (matching canvas)
};

export type OreNodeVisibility = {
  nodeIndex: number; // index into the ORE_REL array
  visibility: EntityVisibility;
};

export type DepositVisibilitySnapshot = {
  depositId: string;
  nodes: OreNodeVisibility[]; // per-node visibility
};

export type WorldVisibilitySnapshot = {
  deposits: DepositVisibilitySnapshot[];
};

export type MissionWorldState = {
  tick: number;
  phase: MissionWorldPhase;
  tickTimeoutMs: number;
  droneIds: string[];
  waitingOn: string[];
  responses: Record<string, DroneTickResponse>;
  drones: Record<string, DroneWorldState>;
  visibility: {
    // per deposit → per node: last known visibility state
    deposits: Record<string, { nodes: EntityVisibility[] }>;
  };
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
  drones: Record<string, DroneWorldState>;
  visibility: WorldVisibilitySnapshot;
};

export type MissionSystemSnapshot = MissionSystemState;

export const DEFAULT_TICK_TIMEOUT_MS = 50;
