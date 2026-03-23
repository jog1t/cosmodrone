// Translation layer: maps MissionWorldSnapshot (actor data) → UI state.
// Components consume this shape; they must not import from useWorldSimulation directly.

import type { MissionWorldSnapshot } from "@cosmodrone/server";
import type { SimulationStatus } from "./useWorldSimulation";

export type DroneUiState = {
  droneId: string;
  status: "ok" | "idle" | "error" | "timeout" | "pending";
  position: { x: number; y: number };
  senseRadius: number;
  color: number;
};

export type OreNodeUiVisibility = {
  nodeIndex: number;
  visibility: "sense" | "memory" | "fog";
};

export type DepositUiVisibility = {
  depositId: string;
  nodes: OreNodeUiVisibility[];
};

export type WorldUiState = {
  tick: string; // zero-padded display string, e.g. "007"
  status: SimulationStatus;
  droneIds: string[];
  drones: Record<string, DroneUiState>;
  objective: string;
  depositVisibility: DepositUiVisibility[];
};

const OBJECTIVE = "Deliver 15 ore";

// Display colors per drone — visual-only, not stored on server
const DRONE_COLORS: Record<string, number> = {
  M1: 0x00cfc0,
  H1: 0x3dd68c,
  S1: 0xbe95ff,
};

function padTick(n: number): string {
  return String(n).padStart(3, "0");
}

export function mapSnapshotToUi(
  snapshot: MissionWorldSnapshot | null,
  status: SimulationStatus,
): WorldUiState {
  if (!snapshot) {
    return {
      tick: "000",
      status,
      droneIds: [],
      drones: {} as Record<string, DroneUiState>,
      objective: OBJECTIVE,
      depositVisibility: [],
    };
  }

  const drones: Record<string, DroneUiState> = {};
  for (const droneId of snapshot.droneIds) {
    const response = snapshot.responses[droneId];
    const worldDrone = snapshot.drones[droneId];
    drones[droneId] = {
      droneId,
      status: response?.status ?? "pending",
      position: worldDrone?.position ?? { x: 0, y: 0 },
      senseRadius: worldDrone?.senseRadius ?? 0.12,
      color: DRONE_COLORS[droneId] ?? 0x94a3b8,
    };
  }

  return {
    tick: padTick(snapshot.tick),
    status,
    droneIds: snapshot.droneIds,
    drones,
    objective: OBJECTIVE,
    depositVisibility: snapshot.visibility?.deposits ?? [],
  };
}
