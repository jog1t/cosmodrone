import { ActionButton } from "./ActionButton";
import { getRouteState, getUplinkState, type WorldState } from "./simulation";
import { ToggleButton } from "./ToggleButton";

type TopBarProps = {
  showAssembler: boolean;
  showInspector: boolean;
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
  world,
  onReset,
  onStep,
  onToggleRun,
  toggleAssembler,
  toggleInspector,
}: TopBarProps) {
  const objectiveStats = [
    { label: "Objective", value: `Deliver ${world.objectiveOre} ore` },
    { label: "Tick", value: world.tick.toString().padStart(3, "0") },
    { label: "Status", value: world.runState === "running" ? "Running" : "Paused" },
    { label: "Failure", value: world.failure ?? "None" },
  ];

  return (
    <header className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(520px,630px)] gap-[1px] bg-[#061019]">
      <div className="grid min-w-0 grid-cols-[minmax(300px,1fr)_minmax(420px,630px)] items-center gap-6 bg-[linear-gradient(180deg,#07131d_0%,#041019_100%)] px-5">
        <div className="min-w-0 pr-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.4em] text-cyan-300/70">
            cosmodrone :: level-01 :: terminal shell
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold uppercase tracking-[0.18em] text-slate-100">
            {world.levelTitle} command deck
          </h1>
          <p className="mission-mono mt-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            uplink {getUplinkState(world.tick)} :: routes {getRouteState(world.tick, world.runState)}
          </p>
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
        <ActionButton command="ctrl+r" label="reset" onClick={onReset} />
        <ActionButton
          active={world.runState === "running"}
          command="space"
          label={world.runState === "running" ? "pause" : "play"}
          onClick={onToggleRun}
        />
        <ActionButton command="." label="step" onClick={onStep} />
      </div>
    </header>
  );
}
