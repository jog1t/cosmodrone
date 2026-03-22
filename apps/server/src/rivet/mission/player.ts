import { actor } from "rivetkit";
import type { registry } from "../actors";
import { getMissionPlayerSnapshot } from "./snapshots";
import type { MissionPlayerSnapshot } from "./types";

export const player = actor({
  options: {
    name: "Cosmodrone Mission Player",
    icon: "user-astronaut",
  },
  state: {
    playerId: "",
    displayName: "",
    droneIds: [] as string[],
  },
  actions: {
    configurePlayer: (
      c,
      input: { playerId: string; displayName: string; droneIds: string[] },
    ): MissionPlayerSnapshot => {
      c.state.playerId = input.playerId;
      c.state.displayName = input.displayName;
      c.state.droneIds = [...input.droneIds];
      return getMissionPlayerSnapshot(c.state);
    },
    updateDroneScript: async (
      c,
      droneId: string,
      script: string,
    ): Promise<MissionPlayerSnapshot> => {
      const sessionId = String(c.key[0] ?? "sandbox");
      const client = c.client<typeof registry>();

      await client.drone.getOrCreate([sessionId, droneId]).updateScript(script);

      return getMissionPlayerSnapshot(c.state);
    },
    getSnapshot: (c): MissionPlayerSnapshot => getMissionPlayerSnapshot(c.state),
  },
});
