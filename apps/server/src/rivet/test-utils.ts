import { setupTest } from "rivetkit/test";
import { registry } from "./actors";

type TestContextLike = Parameters<typeof setupTest>[0];

type BootstrapOptions = {
  sessionId: string;
  playerId: string;
  displayName: string;
  droneIds: string[];
  tickTimeoutMs?: number;
};

type ScriptMap = Record<string, string>;

export async function createMissionTestClient(c: TestContextLike) {
  const { client } = await setupTest(c, registry);
  return client;
}

export async function bootstrapSoloSession(c: TestContextLike, options: BootstrapOptions) {
  const client = await createMissionTestClient(c);

  const systemSnapshot = await client.system.getOrCreate([options.sessionId]).bootstrapSoloSession({
    playerId: options.playerId,
    displayName: options.displayName,
    droneIds: options.droneIds,
    tickTimeoutMs: options.tickTimeoutMs,
  });

  return {
    client,
    systemSnapshot,
  };
}

export async function seedDroneScripts(
  client: Awaited<ReturnType<typeof createMissionTestClient>>,
  sessionId: string,
  playerId: string,
  scripts: ScriptMap,
) {
  for (const [droneId, script] of Object.entries(scripts)) {
    await client.player.getOrCreate([sessionId, playerId]).updateDroneScript(droneId, script);
  }
}
