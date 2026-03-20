export const missionCode = `export function tick() {
  const drone = self();
  const home = base();

  if (drone.battery < 24) {
    moveTo(home.position);
    store("ore");
    return;
  }

  if (drone.cargo.ore < drone.cargo.capacity) {
    moveTo({ x: 18, y: 12 });
    mine();
    return;
  }

  moveTo(home.position);
  store("ore");
}`;

export const objectiveStats = [
  { label: "Objective", value: "Deliver 15 ore" },
  { label: "Tick", value: "084" },
  { label: "Status", value: "Paused" },
  { label: "Failure", value: "None" },
];

export const commandShortcuts = [
  { command: "ctrl+r", label: "reset" },
  { command: "space", label: "run" },
  { command: "f1", label: "docs" },
];

export const templates = [
  { name: "Miner Alpha", chassis: "Miner frame", state: "selected" },
  { name: "Scout Relay", chassis: "Scout frame", state: "queued" },
  { name: "Hauler Queue", chassis: "Cargo frame", state: "locked" },
];

export const inspectorStats = [
  ["Battery", "72 / 100"],
  ["Cargo", "4 / 10 ore"],
  ["Template", "Miner Alpha"],
  ["Loadout", "Drill I | Cargo I"],
  ["memory", "phase:return"],
  ["baseMemory", "ore:north-01"],
] as const;

export const apiSections = [
  { title: "Core", entries: ["self()", "base()", "tick()", "log()", "memory"] },
  { title: "Actions", entries: ["moveTo()", "mine()", "store()", "pickup()"] },
  { title: "Future", entries: ["scan()", "broadcast()", "routePower()"] },
];

export const consoleLines = [
  "[084] miner-alpha :: cargo=4/10 :: route=base",
  "[083] base-aurora :: ore reserve +2",
  "[082] scout-relay :: uplink ping stable",
  "[081] runtime :: loop stable",
];

export const timeline = [
  { tick: "080", label: "launch" },
  { tick: "081", label: "move" },
  { tick: "082", label: "mine" },
  { tick: "083", label: "store" },
  { tick: "084", label: "return" },
];

export const mapStatusLabels = ["POWER BUS :: 93%", "UPLINK :: GREEN", "DRONE ROUTES :: ACTIVE"];

export const droneLabels = [
  ["M1", "miner"],
  ["S1", "scout"],
  ["H1", "hauler"],
] as const;
