import { describe, expect, it } from "vitest";
import { bootstrapSoloSession, seedDroneScripts } from "./test-utils";

describe("world actor", () => {
  it("waits for every drone response before advancing the tick", async (c) => {
    const sessionId = "world-alpha";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-alpha",
      displayName: "Player ALPHA",
      droneIds: ["drone-1", "drone-2"],
      tickTimeoutMs: 80,
    });

    await seedDroneScripts(client, sessionId, {
      "drone-1": JSON.stringify({ type: "idle" }),
      "drone-2": JSON.stringify({ type: "idle" }),
    });

    const snapshot = await client.world.getOrCreate([sessionId]).runTick();

    expect(snapshot.tick).toBe(1);
    expect(snapshot.phase).toBe("resolved");
    expect(snapshot.waitingOn).toEqual([]);
    expect(snapshot.readyForNextTick).toBe(true);
    expect(snapshot.responses["drone-1"]).toMatchObject({
      tick: 1,
      droneId: "drone-1",
      status: "ok",
    });
    expect(snapshot.responses["drone-2"]).toMatchObject({
      tick: 1,
      droneId: "drone-2",
      status: "ok",
    });
  });
});
