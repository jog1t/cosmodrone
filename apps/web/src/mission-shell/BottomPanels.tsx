import { PanelHeader } from "./PanelHeader";
import { type WorldState } from "./simulation";

type BottomPanelsProps = {
  world: WorldState;
};

export function BottomPanels({ world }: BottomPanelsProps) {
  return (
    <section
      className="grid min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-px"
      style={{ background: "var(--panel-separator)" }}
    >
      {/* Console */}
      <article
        className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
        style={{ background: "var(--panel-bg)" }}
      >
        <PanelHeader title="Console" subtitle="runtime feedback" />

        <div
          className="mission-mono min-h-0 overflow-auto px-4 py-3 text-[11px] leading-[1.9]"
          style={{ color: "rgba(100,200,140,0.75)" }}
        >
          {world.consoleLines.map((line) => (
            <p key={line}>
              <span style={{ color: "rgba(52,160,100,0.5)" }} aria-hidden>
                {">"}&nbsp;
              </span>
              {line}
            </p>
          ))}
        </div>
      </article>

      {/* Timeline */}
      <article
        className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
        style={{ background: "var(--panel-bg-alt)" }}
      >
        <PanelHeader title="Timeline" subtitle="execution trace" />

        <div className="min-h-0 overflow-auto p-2.5">
          <div className="grid gap-px" style={{ background: "var(--cold-border)" }}>
            {world.timeline.map((entry) => (
              <div
                key={`${entry.tick}-${entry.label}`}
                className="relative grid grid-cols-[72px_minmax(0,1fr)] items-center overflow-hidden px-4 py-2 transition-colors"
                style={{ background: "var(--panel-bg)" }}
              >
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
                  style={{ background: "rgba(55,120,170,0.2)" }}
                />
                <span className="mission-mono text-[9px] uppercase tracking-[0.26em] text-slate-700">
                  {entry.tick.toString().padStart(4, "0")}
                </span>
                <span className="text-[13px] font-medium uppercase tracking-widest text-slate-300">
                  {entry.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
