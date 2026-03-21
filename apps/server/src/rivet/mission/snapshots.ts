import type {
  MissionDroneSnapshot,
  MissionDroneState,
  MissionPlayerSnapshot,
  MissionPlayerState,
  MissionSystemSnapshot,
  MissionSystemState,
  MissionWorldSnapshot,
  MissionWorldState,
} from "./types";

export function getMissionPlayerSnapshot(state: MissionPlayerState): MissionPlayerSnapshot {
  return {
    playerId: state.playerId,
    displayName: state.displayName,
    droneIds: [...state.droneIds],
    scripts: { ...state.scripts },
  };
}

export function getMissionDroneSnapshot(state: MissionDroneState): MissionDroneSnapshot {
  return {
    droneId: state.droneId,
    playerId: state.playerId,
    script: state.script,
    responseDelayMs: state.responseDelayMs,
    failOnTick: state.failOnTick,
    lastRequestedTick: state.lastRequestedTick,
    lastCompletedTick: state.lastCompletedTick,
    lastResponseStatus: state.lastResponseStatus,
    readyForNextTick: state.lastRequestedTick === state.lastCompletedTick,
  };
}

export function getMissionWorldSnapshot(state: MissionWorldState): MissionWorldSnapshot {
  return {
    tick: state.tick,
    phase: state.phase,
    tickTimeoutMs: state.tickTimeoutMs,
    droneIds: [...state.droneIds],
    waitingOn: [...state.waitingOn],
    responses: { ...state.responses },
    readyForNextTick: state.phase !== "awaiting_drones" && state.waitingOn.length === 0,
  };
}

export function getMissionSystemSnapshot(state: MissionSystemState): MissionSystemSnapshot {
  return {
    sessionId: state.sessionId,
    playerIds: [...state.playerIds],
    droneIds: [...state.droneIds],
  };
}
