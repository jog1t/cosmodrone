import { actor } from "rivetkit";
import type { registry } from "../actors";
import { getMissionPlayerSnapshot } from "./snapshots";
import type { MissionPlayerConfig, MissionPlayerSnapshot } from "./types";

export const player = actor({
  options: {
    name: "Cosmodrone Mission Player",
    icon: "user-astronaut",
  },
  state: {
    playerId: "",
    displayName: "",
    droneIds: [] as string[],
    scripts: {} as Record<string, string>,
  },
  actions: {
    configurePlayer: (c, input: MissionPlayerConfig): MissionPlayerSnapshot => {
      c.state.playerId = input.playerId;
      c.state.displayName = input.displayName;
      c.state.droneIds = [...input.droneIds];

      for (const droneId of input.droneIds) {
        c.state.scripts[droneId] ??= "";
      }

      return getMissionPlayerSnapshot(c.state);
    },
    updateDroneScript: async (
      c,
      droneId: string,
      script: string,
    ): Promise<MissionPlayerSnapshot> => {
      if (!c.state.droneIds.includes(droneId)) {
        c.state.droneIds.push(droneId);
      }

      c.state.scripts[droneId] = script;

      const sessionId = String(c.key[0] ?? "sandbox");
      const client = c.client<typeof registry>();

      await client.drone.getOrCreate([sessionId, droneId]).updateScript(script);

      return getMissionPlayerSnapshot(c.state);
    },
    getSnapshot: (c): MissionPlayerSnapshot => getMissionPlayerSnapshot(c.state),
  },
});
