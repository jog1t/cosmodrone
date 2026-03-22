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
      "drone-1": "return idle",
      "drone-2": "return idle",
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

  it("propagates drone execution errors back into world responses", async (c) => {
    const sessionId = "world-error";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-error",
      displayName: "Player ERROR",
      droneIds: ["drone-ok", "drone-bad"],
      tickTimeoutMs: 50,
    });

    await seedDroneScripts(client, sessionId, {
      "drone-ok": "return idle",
      "drone-bad": "return idle",
    });

    await client.drone.getOrCreate([sessionId, "drone-bad"]).configureBehavior({ failOnTick: 1 });

    const snapshot = await client.world.getOrCreate([sessionId]).runTick();

    expect(snapshot.tick).toBe(1);
    expect(snapshot.phase).toBe("resolved");
    expect(snapshot.responses["drone-ok"]).toMatchObject({ status: "ok" });
    expect(snapshot.responses["drone-bad"]).toMatchObject({
      tick: 1,
      droneId: "drone-bad",
      status: "error",
      error: "failOnTick",
    });
  });
});
