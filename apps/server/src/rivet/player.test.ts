import { describe, expect, it } from "vitest";
import { bootstrapSoloSession } from "./test-utils";

describe("player actor", () => {
  it("propagates script updates into the target drone actor", async (c) => {
    const sessionId = "player-script-sync";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-author",
      displayName: "Player AUTHOR",
      droneIds: ["drone-main"],
    });

    const playerSnapshot = await client.player
      .getOrCreate([sessionId, "player-author"])
      .updateDroneScript("drone-main", "export function tick() { return idle; }");

    expect(playerSnapshot).toEqual({
      playerId: "player-author",
      displayName: "Player AUTHOR",
      droneIds: ["drone-main"],
    });

    expect(await client.drone.getOrCreate([sessionId, "drone-main"]).getSnapshot()).toMatchObject({
      droneId: "drone-main",
      script: "export function tick() { return idle; }",
    });
  });
});
