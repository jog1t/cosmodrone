import { useEffect, useMemo, useState } from "react";
import { createRivetKit } from "@rivetkit/react";

const playerId = `pilot-${crypto.randomUUID().slice(0, 8)}`;
const displayName = `Pilot ${playerId.slice(-4).toUpperCase()}`;

const { useActor } = createRivetKit();

function App() {
  const [snapshot, setSnapshot] = useState<null | {
    phase: "lobby" | "live";
    roomCode: string;
    population: number;
    players: Record<
      string,
      {
        x: number;
        y: number;
        vx: number;
        vy: number;
        hue: number;
        ready: boolean;
        online: boolean;
        displayName: string;
      }
    >;
  }>(null);

  const room = useActor({
    name: "droneRoom",
    key: ["hangar-alpha"],
    params: {
      playerId,
      displayName,
    },
  });

  useEffect(() => {
    if (!room.connection) return;

    room.connection.getSnapshot().then(setSnapshot).catch(console.error);
  }, [room.connection]);

  room.useEvent("snapshot", (nextSnapshot) => {
    setSnapshot(nextSnapshot);
  });

  const playerCards = useMemo(() => {
    if (!snapshot) return [];
    return Object.entries(snapshot.players)
      .sort(([leftId], [rightId]) => leftId.localeCompare(rightId))
      .map(([id, player]) => ({ id, ...player }));
  }, [snapshot]);

  const me = snapshot?.players[playerId];

  async function move(dx: number, dy: number) {
    if (!room.connection || !me) return;

    await room.connection.syncVector({
      x: me.x + dx,
      y: me.y + dy,
      vx: dx,
      vy: dy,
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(82,188,255,0.24),transparent_34%),linear-gradient(180deg,#09111f_0%,#050913_50%,#02050c_100%)] text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-2xl shadow-sky-950/30 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80">
              Cosmodrone bootstrap
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
              Rivet-powered dogfight scaffolding for fast multiplayer iteration.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              The frontend runs on Vite + React + Tailwind v4, while the backend exposes a RivetKit
              room actor you can expand into matchmaking, combat, and simulation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Runtime", "RivetKit 2.1.6 + Hono"],
                ["Frontend", "React 19 + Tailwind 4"],
                ["Code Quality", "oxlint + oxfmt"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">{label}</p>
                  <p className="mt-2 text-sm text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                onClick={() => room.connection?.toggleReady().catch(console.error)}
              >
                {me?.ready ? "Stand down" : "Toggle ready"}
              </button>
              <a
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-cyan-300/50 hover:text-cyan-100"
                href="https://rivet.dev/docs/actors/quickstart/react"
                target="_blank"
                rel="noreferrer"
              >
                Rivet React quickstart
              </a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/60 p-6 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Live room</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                Connection: <span className="text-white">{room.connStatus}</span>
              </p>
              <p>
                Room code:{" "}
                <span className="text-white">{snapshot?.roomCode ?? "hangar-alpha"}</span>
              </p>
              <p>
                Phase: <span className="text-white">{snapshot?.phase ?? "lobby"}</span>
              </p>
              <p>
                Population: <span className="text-white">{snapshot?.population ?? 0}</span>
              </p>
              <p>
                Callsign: <span className="text-white">{displayName}</span>
              </p>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Arena</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Shared drone room actor</h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                100 x 100 grid
              </div>
            </div>

            <div className="relative mt-6 aspect-square overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,23,40,0.95),rgba(5,10,18,0.98))]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:10%_10%]" />
              {playerCards.map((player) => (
                <div
                  key={player.id}
                  className="absolute transition-all duration-200"
                  style={{
                    left: `${player.x}%`,
                    top: `${player.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-[10px] font-bold text-slate-950 shadow-lg"
                    style={{
                      backgroundColor: `hsl(${player.hue} 90% 70%)`,
                      boxShadow: `0 0 24px hsla(${player.hue}, 100%, 70%, 0.45)`,
                    }}
                  >
                    {player.displayName.slice(-2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-sm font-medium">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                onClick={() => move(0, -6)}
              >
                Boost north
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                onClick={() => move(-6, 0)}
              >
                Strafe west
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
                onClick={() => move(6, 0)}
              >
                Strafe east
              </button>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Pilots</p>
              <div className="mt-4 grid gap-3">
                {playerCards.map((player) => (
                  <article
                    key={player.id}
                    className="rounded-3xl border border-white/10 bg-slate-950/45 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{player.displayName}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          x {player.x.toFixed(0)} / y {player.y.toFixed(0)}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs text-slate-950"
                        style={{ backgroundColor: `hsl(${player.hue} 90% 70%)` }}
                      >
                        {player.ready ? "ready" : player.online ? "online" : "idle"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/60 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                Workspace commands
              </p>
              <div className="mission-mono mt-4 space-y-3 text-sm text-slate-300">
                <p>`pnpm install`</p>
                <p>`pnpm dev`</p>
                <p>`pnpm lint`</p>
                <p>`pnpm format`</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
