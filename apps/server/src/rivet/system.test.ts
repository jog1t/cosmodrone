import { describe, expect, it } from "vitest";
import { bootstrapSoloSession } from "./test-utils";

describe("system actor", () => {
  it("stores the bootstrapped session state", async (c) => {
    const sessionId = "system-bootstrap";

    const { client, systemSnapshot } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-seed",
      displayName: "Player SEED",
      droneIds: ["drone-a", "drone-b"],
      tickTimeoutMs: 35,
    });

    expect(systemSnapshot).toEqual({
      sessionId,
      playerIds: ["player-seed"],
      droneIds: ["drone-a", "drone-b"],
    });

    expect(await client.system.getOrCreate([sessionId]).getSnapshot()).toEqual(systemSnapshot);
  });
});
