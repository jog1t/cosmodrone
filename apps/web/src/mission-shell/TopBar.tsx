import type { SimulationStatus } from "./useWorldSimulation";

type TopBarProps = {
  tick: string;
  status: SimulationStatus;
  objective: string;
  isRunning: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
};

const STATUS_LABEL: Record<SimulationStatus, string> = {
  idle: "IDLE",
  running: "RUNNING",
  failed: "FAILED",
};

export function TopBar({
  tick,
  status,
  objective,
  isRunning,
  onRun,
  onPause,
  onReset,
}: TopBarProps) {
  return (
    <header className="flex items-center shrink-0 gap-3.5 px-3.5 py-2 border-b border-border bg-bg-2 select-none">
      {/* Level name */}
      <span className="font-mono whitespace-nowrap text-text-2 fz-sm">
        level-01 / <span className="font-medium text-text">First Loop</span>
      </span>

      {/* Objective ghost text */}
      <span className="font-mono whitespace-nowrap text-text-3 fz-xs">{objective}</span>

      <div className="flex-1" />

      {/* Tick counter */}
      <span className="font-mono text-text-2 flex items-center gap-1.5 fz-sm">
        tick <span className="font-medium text-text min-w-9">{tick}</span>
      </span>

      {/* Status badge */}
      <StatusBadge status={status} label={STATUS_LABEL[status]} />

      {/* Separator */}
      <div className="w-px h-3.5 bg-border-2 shrink-0" />

      {/* RUN / PAUSE morph button */}
      <button
        onClick={isRunning ? onPause : onRun}
        className="flex items-center gap-1.5 border border-teal rounded font-mono font-semibold tracking-wider px-3 py-1 cursor-pointer whitespace-nowrap transition-all duration-150 fz-xs text-teal bg-teal-dim shadow-teal-glow"
      >
        {isRunning ? (
          <svg width={8} height={8} viewBox="0 0 8 8" fill="currentColor">
            <rect x={0} y={0} width={3} height={8} />
            <rect x={5} y={0} width={3} height={8} />
          </svg>
        ) : (
          <svg width={8} height={8} viewBox="0 0 8 8" fill="currentColor">
            <polygon points="0,0 8,4 0,8" />
          </svg>
        )}
        {isRunning ? "PAUSE" : "RUN"}
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 border border-border-2 rounded text-text-2 px-2.5 py-1 cursor-pointer whitespace-nowrap transition-all duration-150 fz-xs"
      >
        ↺ Reset
      </button>
    </header>
  );
}

function StatusBadge({ status, label }: { status: SimulationStatus; label: string }) {
  const borderClass =
    status === "running"
      ? "border-teal/30"
      : status === "failed"
        ? "border-red/30"
        : "border-border";
  const bgClass =
    status === "running" ? "bg-teal-dim" : status === "failed" ? "bg-red-dim" : "bg-bg-4";
  const colorClass =
    status === "running" ? "text-teal" : status === "failed" ? "text-red" : "text-text-3";

  return (
    <span
      className={`font-mono tracking-widest px-1.5 py-0.5 rounded-sm border transition-all duration-300 fz-2xs ${borderClass} ${bgClass} ${colorClass}`}
    >
      {label}
    </span>
  );
}
