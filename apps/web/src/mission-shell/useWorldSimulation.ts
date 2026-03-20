import { useEffect, useReducer } from "react";
import { createInitialWorldState, worldReducer } from "./simulation";

const STEP_INTERVAL_MS = 450;

export function useWorldSimulation() {
  const [world, dispatch] = useReducer(worldReducer, undefined, createInitialWorldState);

  useEffect(() => {
    if (world.runState !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "step" });
      dispatch({ type: "play" });
    }, STEP_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [world.runState]);

  return {
    world,
    play: () => dispatch({ type: "play" }),
    pause: () => dispatch({ type: "pause" }),
    reset: () => dispatch({ type: "reset" }),
    step: () => dispatch({ type: "step" }),
    toggleRun: () => dispatch({ type: "toggle-run" }),
  };
}
