import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { client, type MissionWorldSnapshot } from "../rivet";
import { missionCode } from "./data";
import { createInitialActorWorldState, mapActorSnapshotToWorld, PLAYER_ID } from "./actorWorld";
import type { WorldState } from "./simulation";

const SESSION_ID = "solo-mission";
const STEP_INTERVAL_MS = 450;

export function useWorldSimulation() {
  const [world, setWorld] = useState(createInitialActorWorldState);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const bootstrappedRef = useRef(false);

  const systemActor = useMemo(() => client.system.getOrCreate([SESSION_ID]), []);
  const worldActor = useMemo(() => client.world.getOrCreate([SESSION_ID]), []);

  const applySnapshot = useCallback((snapshot: MissionWorldSnapshot) => {
    setWorld(mapActorSnapshotToWorld(snapshot));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      bootstrappedRef.current = true;

      await systemActor.bootstrapSoloSession({
        playerId: PLAYER_ID,
        displayName: "Player ALPHA",
        droneIds: ["drone_01"],
        tickTimeoutMs: STEP_INTERVAL_MS,
      });

      const droneActor = client.drone.getOrCreate([SESSION_ID, "drone_01"]);
      await droneActor.updateScript(missionCode);
      const snapshot = (await worldActor.getSnapshot()) as MissionWorldSnapshot;

      if (!cancelled) {
        applySnapshot(snapshot);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, systemActor, worldActor]);

  useEffect(() => {
    if (!isReady || !isRunning) {
      return undefined;
    }

    let cancelled = false;

    async function runNextTick() {
      if (cancelled) return;
      const snapshot = await worldActor.runTick();
      if (!cancelled) {
        applySnapshot(snapshot as MissionWorldSnapshot);
        setTimeout(runNextTick, STEP_INTERVAL_MS);
      }
    }

    setTimeout(runNextTick, STEP_INTERVAL_MS);

    return () => {
      cancelled = true;
    };
  }, [applySnapshot, isReady, isRunning, worldActor]);

  const displayWorld: WorldState = {
    ...world,
    runState: isRunning ? "running" : "paused",
  };

  return {
    world: displayWorld,
    isReady,
    reset: async () => {
      setIsRunning(false);
      applySnapshot((await worldActor.resetWorld()) as MissionWorldSnapshot);
    },
    step: async () => {
      setIsRunning(false);
      applySnapshot((await worldActor.runTick()) as MissionWorldSnapshot);
    },
    toggleRun: () => {
      if (!isReady) return;
      setIsRunning((value) => !value);
    },
  };
}
