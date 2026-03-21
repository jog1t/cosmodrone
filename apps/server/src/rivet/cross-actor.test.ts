import { describe, expect, it } from "vitest";
import { bootstrapSoloSession } from "./test-utils";

describe("cross-actor flow", () => {
  it("bootstraps system, player, world, and drone actors together", async (c) => {
    const sessionId = "cross-bootstrap";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-seed",
      displayName: "Player SEED",
      droneIds: ["drone-a", "drone-b"],
      tickTimeoutMs: 35,
    });

    expect(await client.player.getOrCreate([sessionId, "player-seed"]).getSnapshot()).toEqual({
      playerId: "player-seed",
      displayName: "Player SEED",
      droneIds: ["drone-a", "drone-b"],
      scripts: {
        "drone-a": "",
        "drone-b": "",
      },
    });

    expect(await client.world.getOrCreate([sessionId]).getSnapshot()).toEqual({
      tick: 0,
      phase: "idle",
      tickTimeoutMs: 35,
      droneIds: ["drone-a", "drone-b"],
      waitingOn: [],
      responses: {},
      readyForNextTick: true,
    });

    expect(await client.drone.getOrCreate([sessionId, "drone-a"]).getSnapshot()).toMatchObject({
      droneId: "drone-a",
      playerId: "player-seed",
      script: "",
      readyForNextTick: true,
    });
    expect(await client.drone.getOrCreate([sessionId, "drone-b"]).getSnapshot()).toMatchObject({
      droneId: "drone-b",
      playerId: "player-seed",
      script: "",
      readyForNextTick: true,
    });
  });
});
