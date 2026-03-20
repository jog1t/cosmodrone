import { consoleLines, timeline } from "./data";

export function BottomPanels() {
  return (
    <section className="grid min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-[1px] bg-[rgba(86,156,214,0.18)]">
      <article className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#040d15]">
        <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            console
          </p>
          <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            runtime feedback
          </span>
        </div>

        <div className="mission-mono min-h-0 overflow-auto px-4 py-3 text-[12px] leading-7 text-emerald-200">
          {consoleLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </article>

      <article className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#061019]">
        <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            timeline
          </p>
          <span className="mission-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            execution trace
          </span>
        </div>

        <div className="min-h-0 overflow-auto p-3">
          <div className="grid gap-[1px] bg-cyan-400/10">
            {timeline.map((entry) => (
              <div
                key={entry.tick}
                className="grid grid-cols-[88px_minmax(0,1fr)] items-center bg-[#040d15] px-4 py-3"
              >
                <span className="mission-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  tick {entry.tick}
                </span>
                <span className="text-sm uppercase tracking-[0.14em] text-slate-100">
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
