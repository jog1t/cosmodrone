import { ActionButton } from "./ActionButton";
import { getRouteState, getUplinkState, type WorldState } from "./simulation";
import { ToggleButton } from "./ToggleButton";

type TopBarProps = {
  showAssembler: boolean;
  showInspector: boolean;
  controlsDisabled: boolean;
  world: WorldState;
  onReset: () => void;
  onStep: () => void;
  onToggleRun: () => void;
  toggleAssembler: () => void;
  toggleInspector: () => void;
};

export function TopBar({
  showAssembler,
  showInspector,
  controlsDisabled,
  world,
  onReset,
  onStep,
  onToggleRun,
  toggleAssembler,
  toggleInspector,
}: TopBarProps) {
  const isRunning = !controlsDisabled && world.runState === "running";

  const objectiveStats = [
    { label: "Objective", value: `Deliver ${world.objectiveOre} ore` },
    { label: "Tick", value: world.tick.toString().padStart(4, "0") },
    {
      label: "Status",
      value: controlsDisabled ? "Syncing" : isRunning ? "Running" : "Standby",
      warm: isRunning,
    },
    { label: "Failure", value: world.failure ?? "None" },
  ];

  return (
    <header className="grid min-h-0 grid-cols-[minmax(0,1fr)_360px] gap-px" style={{ background: "var(--panel-separator)" }}>
      {/* ── Left: identity + stats ── */}
      <div
        className="relative grid min-w-0 grid-cols-[minmax(260px,1fr)_minmax(380px,540px)] items-center gap-8 overflow-hidden px-6"
        style={{ background: "linear-gradient(180deg, #061524 0%, #040f1c 100%)" }}
      >
        {/* Top accent line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(80,180,230,0.35) 40%, rgba(200,130,50,0.2) 70%, transparent)" }}
        />

        {/* Identity block */}
        <div className="min-w-0">
          <p className="mission-mono text-[9px] uppercase tracking-[0.5em]" style={{ color: "var(--cold-accent-dim)" }}>
            cosmodrone :: level-01 :: terminal shell
          </p>
          <h1 className="mt-1 truncate text-[26px] font-semibold uppercase leading-tight tracking-[0.12em] text-slate-50">
            {world.levelTitle}
            <span className="ml-3 text-[18px] font-normal tracking-[0.08em] text-slate-500">
              command deck
            </span>
          </h1>
          <p className="mission-mono mt-1 text-[9px] uppercase tracking-[0.24em] text-slate-700">
            uplink {getUplinkState(world.tick)} · routes {getRouteState(world.tick, world.runState)}
          </p>
        </div>

        {/* Objective stats MFD */}
        <div
          className="grid min-w-0 grid-cols-4 gap-px"
          style={{ background: "var(--cold-border)", boxShadow: "0 0 20px var(--cold-glow)" }}
        >
          {objectiveStats.map((item) => (
            <article
              key={item.label}
              className="relative overflow-hidden px-3 py-2.5"
              style={{ background: "var(--panel-bg-alt)" }}
            >
              {/* Top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "rgba(80,180,230,0.1)" }} />
              <p className="mission-mono text-[9px] uppercase tracking-[0.35em] text-slate-600">
                {item.label}
              </p>
              <hr className="mt-1.5 border-0 border-t" style={{ borderColor: "var(--cold-border)" }} />
              <p
                className="mt-1.5 text-[15px] font-medium uppercase tracking-[0.1em]"
                style={{ color: item.warm ? "var(--warm-accent)" : "var(--cold-accent)" }}
              >
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* ── Right: controls ── */}
      <div
        className="grid min-w-0 grid-cols-5 gap-px"
        style={{ background: "var(--panel-separator)" }}
      >
        <ToggleButton active={showInspector} command="tab" label="Inspector" onClick={toggleInspector} />
        <ToggleButton active={showAssembler} command="shift+a" label="Assembler" onClick={toggleAssembler} />
        <ActionButton command="ctrl+r" disabled={controlsDisabled} label="Reset" onClick={onReset} />
        <ActionButton
          active={isRunning}
          command="space"
          disabled={controlsDisabled}
          label={isRunning ? "Pause" : "Play"}
          onClick={onToggleRun}
        />
        <ActionButton command="." disabled={controlsDisabled} label="Step" onClick={onStep} />
      </div>
    </header>
  );
}
