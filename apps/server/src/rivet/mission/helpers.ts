import type { DroneTickResponse } from "./types";

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

type MissionDroneClient = {
  drone: {
    getOrCreate: (key: string[]) => {
      runTick: (input: { tick: number }) => Promise<DroneTickResponse | Promise<DroneTickResponse>>;
    };
  };
};

export function createTimeoutResponse(
  droneId: string,
  tick: number,
  timeoutMs: number,
): DroneTickResponse {
  return {
    tick,
    droneId,
    status: "timeout",
    intent: null,
    logs: [`[${tick}] ${droneId} :: timed out after ${timeoutMs}ms`],
    error: `Drone did not respond within ${timeoutMs}ms`,
    memory: {
      lastCompletedTick: Math.max(0, tick - 1),
    },
  };
}

export function collectDroneResponse(
  client: MissionDroneClient,
  sessionId: string,
  droneId: string,
  tick: number,
  timeoutMs: number,
): Promise<DroneTickResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortPromise = new Promise<DroneTickResponse>((resolve) => {
    controller.signal.addEventListener("abort", () => {
      resolve(createTimeoutResponse(droneId, tick, timeoutMs));
    });
  });

  return Promise.race([
    client.drone.getOrCreate([sessionId, droneId]).runTick({ tick }),
    abortPromise,
  ])
    .then((result) => {
      clearTimeout(timeoutId);
      return result;
    })
    .catch((error: unknown) => {
      clearTimeout(timeoutId);
      return {
        tick,
        droneId,
        status: "error" as const,
        intent: null,
        logs: [`[${tick}] ${droneId} :: runtime error`],
        error: error instanceof Error ? error.message : String(error),
        memory: {
          lastCompletedTick: Math.max(0, tick - 1),
        },
      };
    });
}
