import type { DroneTickResponse } from "./types";

type MissionDroneClient = {
  drone: {
    getOrCreate: (key: string[]) => {
      runTick: (input: { tick: number }) => Promise<DroneTickResponse | Promise<DroneTickResponse>>;
    };
  };
};

export function createTimeoutResponse(droneId: string, tick: number): DroneTickResponse {
  return {
    tick,
    droneId,
    status: "timeout",
    intent: null,
    error: null,
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
  const signal = AbortSignal.timeout(timeoutMs);

  try {
    return (await Promise.race([
      client.drone.getOrCreate([sessionId, droneId]).runTick({ tick }),
      new Promise<never>((_, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason)),
      ),
    ])) as DroneTickResponse;
  } catch (error) {
    if (signal.aborted) {
      return createTimeoutResponse(droneId, tick);
    }

    return {
      tick,
      droneId,
      status: "error",
      intent: null,
      error: error instanceof Error ? error.message : String(error),
      memory: {
        lastCompletedTick: Math.max(0, tick - 1),
      },
    };
  }
}
