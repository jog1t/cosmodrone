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
  actions: {
    bootstrapSoloSession: async (
      c,
      input: MissionBootstrapInput,
    ): Promise<MissionSystemSnapshot> => {
      const sessionId = String(c.key[0] ?? "sandbox");
      const client = c.client<typeof registry>();

      c.state.sessionId = sessionId;
      c.state.playerIds = [input.playerId];
      c.state.droneIds = [...input.droneIds];

      await client.world.getOrCreate([sessionId]).configureWorld({
        droneIds: input.droneIds,
        tickTimeoutMs: input.tickTimeoutMs,
      });

      await client.player.getOrCreate([sessionId, input.playerId]).configurePlayer({
        playerId: input.playerId,
        displayName: input.displayName,
        droneIds: input.droneIds,
      });

      await Promise.all(
        input.droneIds.map((droneId) =>
          client.drone
            .getOrCreate([sessionId, droneId], {
              createWithInput: { droneId, playerId: input.playerId },
            })
            .getSnapshot(),
        ),
      );

      return getMissionSystemSnapshot(c.state);
    },
    getSnapshot: (c): MissionSystemSnapshot => getMissionSystemSnapshot(c.state),
  },
});
