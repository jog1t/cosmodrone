import type { MissionWorldSnapshot } from "../rivet";
import type { Position, WorldState } from "./simulation";

export const PLAYER_ID = "player-alpha";

function formatTick(tick: number) {
  return tick.toString().padStart(3, "0");
}

function createConsoleLines(snapshot: MissionWorldSnapshot) {
  const responseEntries = Object.values(snapshot.responses);
  const responseLines = responseEntries.flatMap((response) => response.logs);

  if (snapshot.tick === 0 && responseLines.length === 0) {
    return ["[000] sim :: world actor connected", "[000] drone_01 :: awaiting first tick"];
  }

  return [
    ...responseLines,
    `[${formatTick(snapshot.tick)}] world :: phase=${snapshot.phase}`,
    `[${formatTick(snapshot.tick)}] world :: ready=${snapshot.readyForNextTick ? "yes" : "no"}`,
  ].slice(0, 6);
}

function createTimeline(snapshot: MissionWorldSnapshot) {
  const responseEntries = Object.values(snapshot.responses);

  if (snapshot.tick === 0 && responseEntries.length === 0) {
    return [{ tick: "000", label: "world primed" }];
  }

  return [
    { tick: formatTick(snapshot.tick), label: snapshot.phase.replaceAll("_", " ") },
    ...responseEntries.map((response) => ({
      tick: formatTick(response.tick),
      label: `${response.droneId} :: ${response.status}`,
    })),
  ].slice(0, 6);
}

function deriveDronePosition(tick: number): Position {
  const path = [
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 1 },
  ];

  return path[Math.min(tick, path.length - 1)] ?? path[0];
}

function deriveFailure(snapshot: MissionWorldSnapshot) {
  return (
    Object.values(snapshot.responses).find((response) => response.status === "error")?.error ?? null
  );
}

export function createInitialActorWorldState(): WorldState {
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
    consoleLines: ["[000] sim :: world actor primed", "[000] drone_01 :: awaiting first tick"],
    timeline: [{ tick: "000", label: "world primed" }],
  };
}

export function mapActorSnapshotToWorld(snapshot: MissionWorldSnapshot): WorldState {
  const tick = snapshot.tick;

  return {
    tick,
    runState: "paused",
    failure: deriveFailure(snapshot),
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
      oreStored: Math.max(0, tick - 3),
    },
    oreDeposits: [
      {
        id: "ore_01",
        position: { x: 4, y: 1 },
        amount: Math.max(0, 10 - tick),
      },
    ],
    drones: [
      {
        id: "drone_01",
        name: "Miner Alpha",
        template: "Starter Miner",
        position: deriveDronePosition(tick),
        battery: Math.max(40, 100 - tick * 4),
        cargo: {
          ore: tick > 3 ? 0 : Math.min(tick, 3),
          capacity: 10,
        },
        memory: {
          ore: { x: 4, y: 1 },
        },
      },
    ],
    selectedDroneId: "drone_01",
    consoleLines: createConsoleLines(snapshot),
    timeline: createTimeline(snapshot),
  };
}
