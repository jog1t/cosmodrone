import { commandShortcuts } from "./data";
import type { SimulationStatus } from "./useWorldSimulation";
import { ToggleButton } from "./ToggleButton";

type TopBarProps = {
  showAssembler: boolean;
  showInspector: boolean;
  toggleAssembler: () => void;
  toggleInspector: () => void;
  tick: string;
  status: SimulationStatus;
  isRunning: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
};

const STATUS_LABEL: Record<SimulationStatus, string> = {
  idle: "Idle",
  running: "Running",
  failed: "Failed",
};

export function TopBar({
  showAssembler,
  showInspector,
  toggleAssembler,
  toggleInspector,
  tick,
  status,
  isRunning,
  onRun,
  onPause,
  onReset,
}: TopBarProps) {
  const objectiveStats = [
    { label: "Objective", value: "Deliver 15 ore" },
    { label: "Tick", value: tick },
    { label: "Status", value: STATUS_LABEL[status] },
    { label: "Failure", value: status === "failed" ? "Yes" : "None" },
  ];

  return (
    <header className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(520px,630px)] gap-[1px] bg-[#061019]">
      <div className="grid min-w-0 grid-cols-[minmax(300px,1fr)_minmax(420px,630px)] items-center gap-6 bg-[linear-gradient(180deg,#07131d_0%,#041019_100%)] px-5">
        <div className="min-w-0 pr-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.4em] text-cyan-300/70">
            cosmodrone :: level-01 :: terminal shell
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold uppercase tracking-[0.18em] text-slate-100">
            First loop command deck
          </h1>
        </div>

        <div className="grid min-w-0 grid-cols-4 gap-[1px] border border-cyan-400/20 bg-cyan-400/10">
          {objectiveStats.map((item) => (
            <article key={item.label} className="bg-[#05111a] px-3 py-3">
              <p className="mission-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-cyan-100">{item.value}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-5 gap-[1px] bg-cyan-400/10 p-[1px]">
        <ToggleButton
          active={showInspector}
          command="tab"
          label="inspector"
          onClick={toggleInspector}
        />
        <ToggleButton
          active={showAssembler}
          command="shift+a"
          label="assembler"
          onClick={toggleAssembler}
        />
        <button
          className="flex min-w-0 cursor-pointer items-center justify-between gap-3 bg-[#05111a] px-4 py-4"
          onClick={isRunning ? onPause : onRun}
        >
          <span className="mission-mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            space
          </span>
          <span className="truncate text-sm uppercase tracking-[0.14em] text-slate-200">
            {isRunning ? "pause" : "run"}
          </span>
        </button>
        <button
          className="flex min-w-0 cursor-pointer items-center justify-between gap-3 bg-[#05111a] px-4 py-4"
          onClick={onReset}
        >
          <span className="mission-mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            ctrl+r
          </span>
          <span className="truncate text-sm uppercase tracking-[0.14em] text-slate-200">reset</span>
        </button>
        {commandShortcuts
          .filter((item) => item.command !== "ctrl+r" && item.command !== "space")
          .map((item) => (
            <div
              key={item.command}
              className="flex min-w-0 items-center justify-between gap-3 bg-[#05111a] px-4 py-4"
            >
              <span className="mission-mono shrink-0 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                {item.command}
              </span>
              <span className="truncate text-sm uppercase tracking-[0.14em] text-slate-200">
                {item.label}
              </span>
            </div>
          ))}
      </div>
    </header>
  );
}
