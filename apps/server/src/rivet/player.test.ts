import { describe, expect, it } from "vitest";
import { bootstrapSoloSession } from "./test-utils";

describe("player actor", () => {
  it("returns a snapshot with the configured player identity and drone roster", async (c) => {
    const sessionId = "player-config";

    const { client } = await bootstrapSoloSession(c, {
      sessionId,
      playerId: "player-author",
      displayName: "Player AUTHOR",
      droneIds: ["drone-main", "drone-scout"],
    });

    const snapshot = await client.player.getOrCreate([sessionId, "player-author"]).getSnapshot();

    expect(snapshot).toEqual({
      playerId: "player-author",
      displayName: "Player AUTHOR",
      droneIds: ["drone-main", "drone-scout"],
    });
  });
});
