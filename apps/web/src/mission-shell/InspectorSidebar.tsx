import { PanelHeader } from "./PanelHeader";
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
    ["Memory", `ore:${drone.memory.ore.x},${drone.memory.ore.y}`],
    ["Base ore", `${world.base.oreStored}`],
  ] as const;

  return (
    <aside
      className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
      style={{ background: "var(--panel-bg-alt)" }}
    >
      <PanelHeader title="Inspector" subtitle="selected drone" />

      <div className="min-h-0 overflow-auto px-3 py-3 space-y-2.5">
        {/* Drone identity card */}
        <div
          className="accent-stripe-green relative overflow-hidden p-4 pl-5"
          style={{
            background: "rgba(25,65,45,0.14)",
            border: "1px solid rgba(52,180,120,0.15)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(52,180,120,0.3),transparent)",
            }}
          />
          <p className="mission-mono text-[9px] uppercase tracking-[0.36em] text-emerald-600/80">
            selected drone
          </p>
          <h2 className="mt-2 text-[20px] font-semibold uppercase leading-tight tracking-widest text-slate-100">
            {drone.name}
          </h2>
          <p className="mission-mono mt-2 text-[10px] leading-[1.7] text-slate-600">
            Task 03 keeps the world deterministic while exposing central battery, cargo, memory, and
            map state.
          </p>
        </div>

        {/* Stats table */}
        <div className="gap-px grid" style={{ background: "var(--cold-border)" }}>
          {inspectorStats.map(([label, value]) => (
            <div
              key={label}
              className="relative flex items-center justify-between px-4 py-2.5 transition-colors"
              style={{ background: "var(--panel-bg)" }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
                style={{ background: "rgba(55,120,170,0.2)" }}
              />
              <span className="mission-mono text-[9px] uppercase tracking-[0.3em] text-slate-600">
                {label}
              </span>
              <span
                className="mission-mono text-[11px] uppercase tracking-widest"
                style={{ color: "var(--cold-accent)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Warning card */}
        <div
          className="accent-stripe-warm relative overflow-hidden px-4 py-3 pl-5"
          style={{
            background: "rgba(70,40,8,0.16)",
            border: "1px solid rgba(200,130,50,0.15)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(200,130,50,0.28),transparent)",
            }}
          />
          <p
            className="mission-mono text-[9px] uppercase tracking-[0.34em]"
            style={{ color: "var(--warm-accent-dim)" }}
          >
            warning channel
          </p>
          <p className="mt-2 text-[13px] uppercase tracking-widest text-amber-200/65">
            No actuators yet · stepping only advances the shared world clock
          </p>
        </div>
      </div>
    </aside>
  );
}
