/**
 * Seed script — bootstraps a "sandbox" session matching the frontend's SESSION_ID.
 * Run while the dev server is up: pnpm --filter server seed
 *
 * What it does:
 *   1. Creates system/world/player/drone actors for session "sandbox"
 *   2. Sets each drone's script to a move intent toward the ore deposit
 *   3. Runs a fixed number of ticks so the frontend has live state to display
 */

import { createClient } from "rivetkit/client";
import type { registry } from "./rivet/actors";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:6420";
const SESSION_ID = "sandbox";
const PLAYER_ID = "player-1";
const DRONE_IDS = ["M1", "H1", "S1"];
const TICKS = 20;
const TICK_DELAY_MS = 200;

// Target: move toward the ore deposit cluster centre (normalised coords)
const ORE_TARGET = { x: 0.58, y: 0.4 };

const client = createClient<typeof registry>(SERVER_URL);

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Connecting to ${SERVER_URL} …`);

  // Bootstrap system — idempotent if actors already exist
  console.log(`Bootstrapping session "${SESSION_ID}" …`);
  await client.system
    .getOrCreate([SESSION_ID], {
      createWithInput: {
        playerId: PLAYER_ID,
        displayName: "Player One",
        droneIds: DRONE_IDS,
        tickTimeoutMs: 80,
      },
    })
    .getSnapshot();

  // Reset world state and wire up drone IDs (idempotent — safe to call on existing worlds)
  console.log(`Resetting world with droneIds: ${DRONE_IDS.join(", ")} …`);
  await client.world.getOrCreate([SESSION_ID]).resetWorld({ droneIds: DRONE_IDS });

  console.log(`Setting drone scripts …`);
  for (const droneId of DRONE_IDS) {
    const intent = JSON.stringify({ type: "move", target: ORE_TARGET });
    await client.drone.getOrCreate([SESSION_ID, droneId]).updateScript(intent);
    console.log(`  ${droneId} → move to (${ORE_TARGET.x}, ${ORE_TARGET.y})`);
  }

  const world = client.world.getOrCreate([SESSION_ID]);

  console.log(`Running ${TICKS} ticks …`);
  for (let i = 1; i <= TICKS; i++) {
    const snap = await world.runTick();
    const positions = Object.entries(snap.drones)
      .map(([id, d]) => `${id}=(${d.position.x.toFixed(3)},${d.position.y.toFixed(3)})`)
      .join("  ");
    const vis = snap.visibility.deposits[0]?.visibility ?? "fog";
    console.log(`  tick ${String(snap.tick).padStart(3, "0")}  ${positions}  deposit=${vis}`);
    await sleep(TICK_DELAY_MS);
  }

  console.log("Done. Frontend should now show live state.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
