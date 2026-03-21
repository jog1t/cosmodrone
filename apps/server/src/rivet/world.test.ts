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

    await seedDroneScripts(client, sessionId, "player-alpha", {
      "drone-1": "return idle",
      "drone-2": "return idle",
    });

    await client.drone.getOrCreate([sessionId, "drone-1"]).configureBehavior({ responseDelayMs: 5 });
    await client.drone.getOrCreate([sessionId, "drone-2"]).configureBehavior({ responseDelayMs: 25 });

    const snapshot = await client.world.getOrCreate([sessionId]).runTick();

    expect(snapshot.tick).toBe(1);
    expect(snapshot.phase).toBe("resolved");
    expect(snapshot.waitingOn).toEqual([]);
    expect(snapshot.readyForNextTick).toBe(true);
    expect(snapshot.responses["drone-1"]).toMatchObject({ tick: 1, droneId: "drone-1", status: "ok" });
    expect(snapshot.responses["drone-2"]).toMatchObject({ tick: 1, droneId: "drone-2", status: "ok" });
  });

  it("marks non-responsive drones as timeout and still resolves the barrier", async (c) => {
    const sessionId = "world-timeout";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-bravo",
      displayName: "Player BRAVO",
      droneIds: ["drone-fast", "drone-slow"],
      tickTimeoutMs: 20,
    });

    await seedDroneScripts(client, sessionId, "player-bravo", {
      "drone-fast": "return idle",
      "drone-slow": "return idle",
    });

    await client.drone.getOrCreate([sessionId, "drone-fast"]).configureBehavior({ responseDelayMs: 0 });
    await client.drone.getOrCreate([sessionId, "drone-slow"]).configureBehavior({ responseDelayMs: 60 });

    const snapshot = await client.world.getOrCreate([sessionId]).runTick();

    expect(snapshot.tick).toBe(1);
    expect(snapshot.phase).toBe("resolved");
    expect(snapshot.waitingOn).toEqual([]);
    expect(snapshot.readyForNextTick).toBe(true);
    expect(snapshot.responses["drone-fast"]).toMatchObject({ tick: 1, droneId: "drone-fast", status: "ok" });
    expect(snapshot.responses["drone-slow"]).toMatchObject({ tick: 1, droneId: "drone-slow", status: "timeout" });
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

    await seedDroneScripts(client, sessionId, "player-error", {
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
      error: "Drone drone-bad failed on tick 1",
    });
  });
});
