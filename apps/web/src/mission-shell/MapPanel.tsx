import { Application } from "@pixi/react";
import { useRef } from "react";
import type { DepositUiVisibility, DroneUiState } from "./actorWorld";
import { MapPixiScene } from "./MapPixiScene";
import type { SimulationStatus } from "./useWorldSimulation";

type MapPanelProps = {
  status: SimulationStatus;
  depositVisibility: DepositUiVisibility[];
  drones: Record<string, DroneUiState>;
};

export function MapPanel({ status, depositVisibility, drones }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="flex flex-col bg-bg border-r border-border overflow-hidden">
      {/* Map toolbar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border bg-bg-2 shrink-0">
        <span className="font-mono uppercase tracking-widest text-text-3 font-medium fz-2xs">
          map
        </span>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <Application
          className="block w-full h-full"
          resizeTo={containerRef}
          backgroundColor={0x02070d}
          antialias
          autoDensity
          resolution={window.devicePixelRatio || 1}
        >
          <MapPixiSceneWrapper
            containerRef={containerRef}
            depositVisibility={depositVisibility}
            drones={drones}
          />
        </Application>

        {/* Failure vignette overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-400 ${
            status === "failed" ? "bg-[rgba(10,6,6,0.45)]" : "bg-transparent"
          }`}
        />
      </div>
    </section>
  );
}

function MapPixiSceneWrapper({
  containerRef,
  depositVisibility,
  drones,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  depositVisibility: DepositUiVisibility[];
  drones: Record<string, DroneUiState>;
}) {
  const el = containerRef.current;
  const width = el?.clientWidth ?? 600;
  const height = el?.clientHeight ?? 400;

  const depositVis = depositVisibility.find((d) => d.depositId === "ore_cluster_a1") ?? {
    depositId: "ore_cluster_a1",
    nodes: [],
  };

  return (
    <MapPixiScene
      width={width}
      height={height}
      showSense={true}
      showTrail={true}
      depositVisibility={depositVis}
      drones={Object.values(drones)}
    />
  );
}
