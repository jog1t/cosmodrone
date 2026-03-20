import { setupTest } from "rivetkit/test";
import { describe, expect, it, vi } from "vitest";
import { registry } from "./actors";

describe("droneRoom actor", () => {
  it("persists player state through actor actions", async (c) => {
    const { client } = await setupTest(c, registry);
    const room = client.droneRoom.getOrCreate(["hangar-alpha"], {
      params: {
        playerId: "pilot-alpha",
        displayName: "Pilot ALPHA",
      },
    });
    const connection = room.connect();

    expect(await connection.getSnapshot()).toMatchObject({
      phase: "lobby",
      population: 1,
      roomCode: "hangar-alpha",
      players: {
        "pilot-alpha": {
          displayName: "Pilot ALPHA",
          online: true,
          ready: false,
          x: 50,
          y: 50,
        },
      },
    });

    await connection.toggleReady();
    await connection.syncVector({ x: 120, y: -10, vx: 8, vy: -8 });

    expect(await connection.getSnapshot()).toMatchObject({
      phase: "live",
      players: {
        "pilot-alpha": {
          ready: true,
          x: 100,
          y: 0,
          vx: 3,
          vy: -3,
        },
      },
    });

    await connection.dispose();
  });

  it("broadcasts snapshot events to connected clients", async (c) => {
    const { client } = await setupTest(c, registry);
    const room = client.droneRoom.getOrCreate(["hangar-alpha"], {
      params: {
        playerId: "pilot-bravo",
        displayName: "Pilot BRAVO",
      },
    });
    const connection = room.connect();
    const onSnapshot = vi.fn();

    connection.on("snapshot", onSnapshot);

    await connection.toggleReady();

    await vi.waitFor(() => {
      expect(onSnapshot).toHaveBeenCalled();
    });

    await connection.dispose();
  });
});

describe("roomIndex actor", () => {
  it("tracks featured rooms without duplicates", async (c) => {
    const { client } = await setupTest(c, registry);
    const roomIndex = client.roomIndex.getOrCreate(["main"]);

    expect(await roomIndex.listFeaturedRooms()).toEqual(["hangar-alpha"]);

    await roomIndex.ensureRoomListed("asteroid-belt");
    await roomIndex.ensureRoomListed("hangar-alpha");

    expect(await roomIndex.listFeaturedRooms()).toEqual(["asteroid-belt", "hangar-alpha"]);
  });
});
