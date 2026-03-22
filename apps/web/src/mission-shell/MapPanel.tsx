import { useRef } from "react";
import { getPowerBusLevel, getRouteState, getUplinkState, type WorldState } from "./simulation";
import { PanelHeader } from "./PanelHeader";
import { useMissionMapCanvas } from "./useMissionMapCanvas";

type MapPanelProps = {
  world: WorldState;
};

export function MapPanel({ world }: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statusLabels = [
    `Power Bus · ${getPowerBusLevel(world.tick)}%`,
    `Uplink · ${getUplinkState(world.tick)}`,
    `Sim · ${getRouteState(world.tick, world.runState)}`,
  ];

  useMissionMapCanvas(canvasRef, world);

  return (
    <section
      className="grid min-h-0 grid-rows-[42px_minmax(0,1fr)]"
      style={{ background: "var(--panel-bg)" }}
    >
      <PanelHeader
        title="Map Renderer"
        subtitle={`${world.base.name.toLowerCase()} · ${world.drones.length} drone · ${world.oreDeposits.length} ore node`}
      />

      <div className="relative min-h-0 p-3">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ background: "#010508", border: "1px solid var(--cold-border)" }}
        />

        {/* Top-left status badges */}
        <div className="pointer-events-none absolute left-6 top-6 grid gap-1.5">
          {statusLabels.map((label) => (
            <div
              key={label}
              className="mission-mono px-2.5 py-1.5 text-[9px] uppercase tracking-[0.22em] backdrop-blur-sm"
              style={{
                background: "rgba(2,8,18,0.88)",
                border: "1px solid var(--cold-border)",
                color: "var(--cold-accent-dim)",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom-left drone badges */}
        <div className="pointer-events-none absolute bottom-6 left-6 flex gap-1.5">
          {world.drones.map((drone) => (
            <div
              key={drone.id}
              className="mission-mono px-2.5 py-1.5 text-[9px] uppercase tracking-[0.2em] backdrop-blur-sm"
              style={{
                background: "rgba(2,8,18,0.88)",
                border: "1px solid var(--cold-border)",
                color: "var(--cold-accent-dim)",
              }}
            >
              {drone.id.toUpperCase()} · {drone.position.x},{drone.position.y}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
