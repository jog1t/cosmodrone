import { createClient } from "rivetkit/client";

export type MissionWorldPhase = "idle" | "awaiting_drones" | "resolved";

export type MissionWorldSnapshot = {
  tick: number;
  phase: MissionWorldPhase;
  tickTimeoutMs: number;
  droneIds: string[];
  waitingOn: string[];
  responses: Record<
    string,
    {
      tick: number;
      droneId: string;
      status: "ok" | "idle" | "error" | "timeout";
      intent: { type: "idle" } | null;
      logs: string[];
      error: string | null;
      memory: {
        lastCompletedTick: number;
      };
    }
  >;
  readyForNextTick: boolean;
};

export const client = createClient();
