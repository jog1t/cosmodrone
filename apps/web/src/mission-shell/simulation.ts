export type Position = {
  x: number;
  y: number;
};

export type DroneState = {
  id: string;
  name: string;
  template: string;
  position: Position;
  battery: number;
  cargo: {
    ore: number;
    capacity: number;
  };
  memory: {
    ore: Position;
  };
};

export type OreDeposit = {
  id: string;
  position: Position;
  amount: number;
};

export type TimelineEntry = {
  tick: string;
  label: string;
};

export type WorldState = {
  tick: number;
  runState: "paused" | "running";
  failure: string | null;
  levelTitle: string;
  objectiveOre: number;
  bonusTicks: number;
  map: {
    width: number;
    height: number;
  };
  base: {
    id: string;
    name: string;
    position: Position;
    oreStored: number;
  };
  oreDeposits: OreDeposit[];
  drones: DroneState[];
  selectedDroneId: string;
  consoleLines: string[];
  timeline: TimelineEntry[];
};

export function selectDrone(state: WorldState) {
  return state.drones.find((drone) => drone.id === state.selectedDroneId) ?? state.drones[0];
}

export function getPowerBusLevel(tick: number) {
  return 92 + (tick % 4) * 2;
}

export function getUplinkState(tick: number) {
  return tick % 2 === 0 ? "GREEN" : "SYNC";
}

export function getRouteState(tick: number, runState: WorldState["runState"]) {
  if (runState === "running") {
    return tick % 2 === 0 ? "LOCKED" : "TRACKING";
  }

  return tick === 0 ? "READY" : "HOLD";
}
