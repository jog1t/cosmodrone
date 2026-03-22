import { useEffect, useState } from "react";
import { useActor } from "../rivet";
import type { MissionWorldSnapshot } from "@cosmodrone/server";

const SESSION_ID = "sandbox";
const DRONE_IDS = ["miner-alpha"];
const TICK_INTERVAL_MS = 450;

export type SimulationStatus = "idle" | "running" | "failed";

export type SimulationState = {
  snapshot: MissionWorldSnapshot | null;
  status: SimulationStatus;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
};

export function useWorldSimulation(): SimulationState {
  const [snapshot, setSnapshot] = useState<MissionWorldSnapshot | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Connect to the world actor for the sandbox session.
  // useActor manages the connection lifecycle — it reconnects automatically.
  const world = useActor({ name: "world", key: [SESSION_ID] });

  // Subscribe to snapshot events broadcast by the server after each tick.
  world.useEvent("snapshot", (incoming: MissionWorldSnapshot) => {
    setSnapshot(incoming);
  });

  // Bootstrap the session on first connection. system.getOrCreate initialises
  // the world, player, and drone actors if they don't exist yet.
  useEffect(() => {
    if (world.connStatus !== "connected" || !world.connection) return;

    void (async () => {
      const initial = await world.connection!.getSnapshot();
      setSnapshot(initial);
    })();
  }, [world.connStatus, world.connection]);

  // Drive ticks while isRunning is true. Uses a cancellable async loop
  // so ticks never overlap — each tick waits for the previous to complete.
  useEffect(() => {
    if (!isRunning) return;

    let cancelled = false;

    const loop = async () => {
      while (!cancelled && world.connection) {
        const snap = await world.connection.runTick();
        if (!cancelled) setSnapshot(snap);
        await new Promise((resolve) => setTimeout(resolve, TICK_INTERVAL_MS));
      }
    };

    void loop();

    return () => {
      cancelled = true;
    };
  }, [isRunning, world.connection]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    if (!world.connection) return;
    void world.connection.resetWorld().then((snap) => setSnapshot(snap));
  };

  const status: SimulationStatus = (() => {
    if (!snapshot) return "idle";
    const anyFailed = Object.values(snapshot.responses).some((r) => r.status === "error");
    if (anyFailed) return "failed";
    return isRunning ? "running" : "idle";
  })();

  return { snapshot, status, isRunning, start, pause, reset };
}

export { SESSION_ID, DRONE_IDS };
