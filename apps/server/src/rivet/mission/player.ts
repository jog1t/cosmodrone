import { actor } from "rivetkit";
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
    getSnapshot: (c): MissionPlayerSnapshot => getMissionPlayerSnapshot(c.state),
  },
});
