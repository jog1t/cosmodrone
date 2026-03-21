import { actor, event, setup } from "rivetkit";

const GRID_SIZE = 100;
const ROOM_CAPACITY = 8;

type FlightVector = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  ready: boolean;
  online: boolean;
  displayName: string;
  updatedAt: number;
};

type RoomSnapshot = {
  phase: "lobby" | "live";
  roomCode: string;
  population: number;
  players: Record<string, FlightVector>;
};

type PilotParams = {
  playerId: string;
  displayName: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashHue(seed: string): number {
  let total = 0;
  for (const char of seed) total = (total + char.charCodeAt(0) * 17) % 360;
  return total;
}

function getSnapshot(roomCode: string, players: Record<string, FlightVector>): RoomSnapshot {
  return {
    phase: Object.values(players).some((player) => player.ready) ? "live" : "lobby",
    roomCode,
    population: Object.keys(players).length,
    players,
  };
}

export const roomIndex = actor({
  options: {
    name: "Cosmodrone Room Index",
    icon: "satellite-dish",
  },
  state: {
    featuredRooms: ["hangar-alpha"],
  },
  actions: {
    listFeaturedRooms: (c) => c.state.featuredRooms,
    ensureRoomListed: (c, roomCode: string) => {
      if (!c.state.featuredRooms.includes(roomCode)) c.state.featuredRooms.unshift(roomCode);
      c.state.featuredRooms = c.state.featuredRooms.slice(0, 6);
      return c.state.featuredRooms;
    },
  },
});

export const droneRoom = actor({
  options: {
    name: "Cosmodrone Flight Room",
    icon: "rocket",
  },
  state: {
    players: {} as Record<string, FlightVector>,
  },
  events: {
    snapshot: event<RoomSnapshot>(),
  },
  createConnState: (_c, params: PilotParams) => ({
    playerId: params.playerId,
    displayName: params.displayName,
  }),
  onConnect: (c, conn) => {
    const roomCode = String(c.key[0] ?? "sandbox");
    const { playerId, displayName } = conn.state;
    const existing = c.state.players[playerId];

    if (!existing && Object.keys(c.state.players).length >= ROOM_CAPACITY) {
      throw new Error("Room capacity reached");
    }

    c.state.players[playerId] = {
      x: existing?.x ?? 50,
      y: existing?.y ?? 50,
      vx: existing?.vx ?? 0,
      vy: existing?.vy ?? 0,
      hue: existing?.hue ?? hashHue(playerId),
      ready: existing?.ready ?? false,
      online: true,
      displayName,
      updatedAt: Date.now(),
    };

    c.broadcast("snapshot", getSnapshot(roomCode, c.state.players));
  },
  onDisconnect: (c, conn) => {
    const roomCode = String(c.key[0] ?? "sandbox");
    const player = c.state.players[conn.state.playerId];
    if (!player) return;

    player.online = false;
    player.updatedAt = Date.now();
    c.broadcast("snapshot", getSnapshot(roomCode, c.state.players));
  },
  actions: {
    getSnapshot: (c) => getSnapshot(String(c.key[0] ?? "sandbox"), c.state.players),
    toggleReady: (c) => {
      const pilot = c.state.players[c.conn.state.playerId];
      if (!pilot) throw new Error("Pilot not connected");

      pilot.ready = !pilot.ready;
      pilot.updatedAt = Date.now();
      const snapshot = getSnapshot(String(c.key[0] ?? "sandbox"), c.state.players);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
    syncVector: (c, next: { x: number; y: number; vx: number; vy: number }) => {
      const pilot = c.state.players[c.conn.state.playerId];
      if (!pilot) throw new Error("Pilot not connected");

      pilot.x = clamp(next.x, 0, GRID_SIZE);
      pilot.y = clamp(next.y, 0, GRID_SIZE);
      pilot.vx = clamp(next.vx, -3, 3);
      pilot.vy = clamp(next.vy, -3, 3);
      pilot.updatedAt = Date.now();

      const snapshot = getSnapshot(String(c.key[0] ?? "sandbox"), c.state.players);
      c.broadcast("snapshot", snapshot);
      return snapshot;
    },
  },
});

export const registry = setup({
  use: {
    roomIndex,
    droneRoom,
  },
  // Serverless mode: publicEndpoint and publicToken are read from
  // RIVET_PUBLIC_ENDPOINT and RIVET_PUBLIC_TOKEN env vars automatically.
  serverless: {},
});
