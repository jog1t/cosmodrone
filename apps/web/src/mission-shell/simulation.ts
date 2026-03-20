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

type WorldAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "toggle-run" }
  | { type: "step" }
  | { type: "reset" };

const TIMELINE_LABELS = [
  "clock pulse",
  "world snapshot",
  "map redraw",
  "idle hold",
] as const;

const CONSOLE_LABELS = [
  "sim :: deterministic step committed",
  "world :: state cache refreshed",
  "map :: renderer synced to tick",
  "drone_01 :: standing by for actuators",
] as const;

const MAX_CONSOLE_LINES = 6;
const MAX_TIMELINE_ENTRIES = 6;

function formatTick(tick: number) {
  return tick.toString().padStart(3, "0");
}

function createConsoleLines(tick: number) {
  const lines: string[] = [
    "[000] sim :: world state primed",
    "[000] map :: level-01 layout loaded",
    "[000] drone_01 :: awaiting first tick",
  ];

  for (let currentTick = 1; currentTick <= tick; currentTick += 1) {
    const label = CONSOLE_LABELS[(currentTick - 1) % CONSOLE_LABELS.length];
    lines.unshift(`[${formatTick(currentTick)}] ${label}`);
  }

  return lines.slice(0, MAX_CONSOLE_LINES);
}

function createTimeline(tick: number) {
  const entries: TimelineEntry[] = [{ tick: "000", label: "world primed" }];

  for (let currentTick = 1; currentTick <= tick; currentTick += 1) {
    entries.unshift({
      tick: formatTick(currentTick),
      label: TIMELINE_LABELS[(currentTick - 1) % TIMELINE_LABELS.length],
    });
  }

  return entries.slice(0, MAX_TIMELINE_ENTRIES);
}

export function createInitialWorldState(): WorldState {
  return {
    tick: 0,
    runState: "paused",
    failure: null,
    levelTitle: "First Loop",
    objectiveOre: 10,
    bonusTicks: 80,
    map: {
      width: 8,
      height: 8,
    },
    base: {
      id: "base_01",
      name: "Base Aurora",
      position: { x: 1, y: 1 },
      oreStored: 0,
    },
    oreDeposits: [
      {
        id: "ore_01",
        position: { x: 4, y: 1 },
        amount: 10,
      },
    ],
    drones: [
      {
        id: "drone_01",
        name: "Miner Alpha",
        template: "Starter Miner",
        position: { x: 1, y: 2 },
        battery: 100,
        cargo: {
          ore: 0,
          capacity: 10,
        },
        memory: {
          ore: { x: 4, y: 1 },
        },
      },
    ],
    selectedDroneId: "drone_01",
    consoleLines: createConsoleLines(0),
    timeline: createTimeline(0),
  };
}

export function advanceWorld(state: WorldState): WorldState {
  const nextTick = state.tick + 1;

  return {
    ...state,
    tick: nextTick,
    consoleLines: createConsoleLines(nextTick),
    timeline: createTimeline(nextTick),
  };
}

export function worldReducer(state: WorldState, action: WorldAction): WorldState {
  switch (action.type) {
    case "play":
      return { ...state, runState: "running" };
    case "pause":
      return { ...state, runState: "paused" };
    case "toggle-run":
      return { ...state, runState: state.runState === "running" ? "paused" : "running" };
    case "step":
      return advanceWorld({ ...state, runState: "paused" });
    case "reset":
      return createInitialWorldState();
    default:
      return state;
  }
}

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
