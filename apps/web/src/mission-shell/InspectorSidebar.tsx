import { selectDrone, type WorldState } from "./simulation";

type InspectorSidebarProps = {
  world: WorldState;
};

export function InspectorSidebar({ world }: InspectorSidebarProps) {
  const drone = selectDrone(world);
  const inspectorStats = [
    ["Battery", `${drone.battery} / 100`],
    ["Cargo", `${drone.cargo.ore} / ${drone.cargo.capacity} ore`],
    ["Template", drone.template],
    ["Position", `(${drone.position.x}, ${drone.position.y})`],
    ["memory", `ore:${drone.memory.ore.x},${drone.memory.ore.y}`],
    ["baseOre", `${world.base.oreStored}`],
  ] as const;

  return (
    <aside className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#061019]">
      <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
        <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
          inspector
        </p>
        <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
          selected drone
        </span>
      </div>

      <div className="min-h-0 overflow-auto px-4 py-4">
        <div className="border border-emerald-400/18 bg-emerald-400/[0.05] p-4">
          <p className="mission-mono text-[10px] uppercase tracking-[0.28em] text-emerald-300/75">
            selected drone
          </p>
          <h2 className="mt-3 text-lg font-semibold uppercase tracking-[0.18em] text-slate-100">
            {drone.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Task 03 keeps the world deterministic while exposing central battery, cargo, memory, and map state.
          </p>
        </div>

        <div className="mt-4 grid gap-[1px] bg-cyan-400/10">
          {inspectorStats.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between bg-[#040d15] px-4 py-3">
              <span className="mission-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                {label}
              </span>
              <span className="text-sm uppercase tracking-[0.12em] text-cyan-100">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border border-amber-300/18 bg-amber-300/[0.04] px-4 py-3">
          <p className="mission-mono text-[10px] uppercase tracking-[0.26em] text-amber-200/70">
            warning channel
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.12em] text-amber-100">
            no actuators yet :: stepping only advances the shared world clock
          </p>
        </div>
      </div>
    </aside>
  );
}
