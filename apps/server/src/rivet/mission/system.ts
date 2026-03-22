import { actor } from "rivetkit";
import type { registry } from "../actors";
import { getMissionSystemSnapshot } from "./snapshots";
import type { MissionBootstrapInput, MissionSystemSnapshot } from "./types";

export const system = actor({
  options: {
    name: "Cosmodrone Mission System",
    icon: "diagram-project",
  },
  state: {
    sessionId: "",
    playerIds: [] as string[],
    droneIds: [] as string[],
  },
  onCreate: async (c, input: MissionBootstrapInput): Promise<void> => {
    const sessionId = String(c.key[0] ?? "sandbox");
    const client = c.client<typeof registry>();

    c.state.sessionId = sessionId;
    c.state.playerIds = [input.playerId];
    c.state.droneIds = [...input.droneIds];

    await client.world
      .getOrCreate([sessionId], {
        createWithInput: { droneIds: input.droneIds, tickTimeoutMs: input.tickTimeoutMs },
      })
      .getSnapshot();

    await client.player
      .getOrCreate([sessionId, input.playerId], {
        createWithInput: {
          playerId: input.playerId,
          displayName: input.displayName,
          droneIds: input.droneIds,
        },
      })
      .getSnapshot();

    await Promise.all(
      input.droneIds.map((droneId) =>
        client.drone
          .getOrCreate([sessionId, droneId], {
            createWithInput: { droneId, playerId: input.playerId },
          })
          .getSnapshot(),
      ),
    );
  },
  actions: {
    getSnapshot: (c): MissionSystemSnapshot => getMissionSystemSnapshot(c.state),
  },
});
