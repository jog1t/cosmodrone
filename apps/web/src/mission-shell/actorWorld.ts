// Translation layer: maps MissionWorldSnapshot (actor data) → UI state.
// Components consume this shape; they must not import from useWorldSimulation directly.

import type { MissionWorldSnapshot } from "@cosmodrone/server";
import type { SimulationStatus } from "./useWorldSimulation";

export type DroneUiState = {
  droneId: string;
  status: "ok" | "idle" | "error" | "timeout" | "pending";
};

export type WorldUiState = {
  tick: string; // zero-padded display string, e.g. "007"
  status: SimulationStatus;
  droneIds: string[];
  drones: Record<string, DroneUiState>;
  objective: string;
};

const OBJECTIVE = "Deliver 15 ore";

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
      drones: {},
      objective: OBJECTIVE,
    };
  }

  const drones: Record<string, DroneUiState> = {};
  for (const droneId of snapshot.droneIds) {
    const response = snapshot.responses[droneId];
    drones[droneId] = {
      droneId,
      status: response?.status ?? "pending",
    };
  }

  return {
    tick: padTick(snapshot.tick),
    status,
    droneIds: snapshot.droneIds,
    drones,
    objective: OBJECTIVE,
  };
}
