import { useRef } from "react";
import { getPowerBusLevel, getRouteState, getUplinkState, type WorldState } from "./simulation";
import { useMissionMapCanvas } from "./useMissionMapCanvas";

type MapPanelProps = {
  world: WorldState;
};

export function MapPanel({ world }: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusLabels = [
    `POWER BUS :: ${getPowerBusLevel(world.tick)}%`,
    `UPLINK :: ${getUplinkState(world.tick)}`,
    `SIM :: ${getRouteState(world.tick, world.runState)}`,
  ];

  useMissionMapCanvas(canvasRef, world);

  return (
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)] bg-[#040d15]">
      <article className="grid min-h-0 grid-rows-[48px_minmax(0,1fr)] bg-[#040d15]">
        <div className="flex items-center justify-between border-b border-cyan-400/15 px-4">
          <p className="mission-mono text-[11px] uppercase tracking-[0.34em] text-cyan-300/70">
            map renderer
          </p>
          <div className="mission-mono flex gap-4 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            <span>{world.base.name.toLowerCase()}</span>
            <span>{world.drones.length} drone</span>
            <span>{world.oreDeposits.length} ore node</span>
          </div>
        </div>

        <div className="relative min-h-0 p-3">
          <canvas
            ref={canvasRef}
            className="h-full w-full border border-cyan-400/15 bg-[#02070d]"
          />

          <div className="pointer-events-none absolute left-6 top-6 grid gap-2">
            {statusLabels.map((label) => (
              <div
                key={label}
                className="mission-mono border border-cyan-400/15 bg-[#03111b]/95 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-6 left-6 flex gap-2">
            {world.drones.map((drone) => (
              <div
                key={drone.id}
                className="mission-mono border border-cyan-400/15 bg-[#03111b]/95 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100"
              >
                {drone.id.toUpperCase()} :: HOLDING AT ({drone.position.x},{drone.position.y})
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
