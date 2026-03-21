import type { DroneTickResponse } from "./types";

type MissionDroneClient = {
  drone: {
    getOrCreate: (key: string[]) => {
      runTick: (input: { tick: number }) => Promise<DroneTickResponse | Promise<DroneTickResponse>>;
    };
  };
};

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

export async function collectDroneResponse(
  client: MissionDroneClient,
  sessionId: string,
  droneId: string,
  tick: number,
  timeoutMs: number,
): Promise<DroneTickResponse> {
  const timeoutResponse = createTimeoutResponse(droneId, tick, timeoutMs);

  try {
    const response = client.drone
      .getOrCreate([sessionId, droneId])
      .runTick({ tick })
      .then((value) => value);

    return await new Promise<DroneTickResponse>((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(timeoutResponse);
      }, timeoutMs);

      response
        .then((value) => {
          clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((error: unknown) => {
          clearTimeout(timeoutId);
          resolve({
            tick,
            droneId,
            status: "error",
            intent: null,
            logs: [`[${tick}] ${droneId} :: runtime error`],
            error: error instanceof Error ? error.message : String(error),
            memory: {
              lastCompletedTick: Math.max(0, tick - 1),
            },
          });
        });
    });
  } catch (error) {
    return {
      tick,
      droneId,
      status: "error",
      intent: null,
      logs: [`[${tick}] ${droneId} :: world request failed`],
      error: error instanceof Error ? error.message : String(error),
      memory: {
        lastCompletedTick: Math.max(0, tick - 1),
      },
    };
  }
}
