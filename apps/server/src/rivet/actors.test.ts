import { describe, expect, it } from "vitest";
import { GRID_SIZE, ROOM_CAPACITY, clamp, getSnapshot, hashHue } from "./actors";

describe("actors helpers", () => {
  it("keeps movement values inside the configured arena", () => {
    expect(clamp(-10, 0, GRID_SIZE)).toBe(0);
    expect(clamp(55, 0, GRID_SIZE)).toBe(55);
    expect(clamp(110, 0, GRID_SIZE)).toBe(GRID_SIZE);
  });

  it("creates deterministic hues and room snapshots", () => {
    const players = {
      alpha: {
        x: 10,
        y: 20,
        vx: 0,
        vy: 0,
        hue: hashHue("alpha"),
        ready: true,
        online: true,
        displayName: "Pilot ALPHA",
        updatedAt: 0,
      },
      beta: {
        x: 30,
        y: 40,
        vx: 1,
        vy: -1,
        hue: hashHue("beta"),
        ready: false,
        online: false,
        displayName: "Pilot BETA",
        updatedAt: 1,
      },
    };

    expect(hashHue("alpha")).toBe(hashHue("alpha"));
    expect(hashHue("alpha")).not.toBe(hashHue("beta"));

    const snapshot = getSnapshot("hangar-alpha", players);

    expect(snapshot.roomCode).toBe("hangar-alpha");
    expect(snapshot.phase).toBe("live");
    expect(snapshot.population).toBe(2);
    expect(snapshot.players.alpha.displayName).toBe("Pilot ALPHA");
  });

  it("keeps the intended room capacity constant", () => {
    expect(ROOM_CAPACITY).toBe(8);
  });
});
