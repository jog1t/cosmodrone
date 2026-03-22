import { setup } from "rivetkit";
import { drone, player, system, world } from "./mission";

export { drone, player, system, world };

export const registry = setup({
  use: {
    drone,
    player,
    system,
    world,
  },
});
