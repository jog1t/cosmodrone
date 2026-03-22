import { useRef, useState } from "react";
import { useMissionMapCanvas } from "./useMissionMapCanvas";
import type { SimulationStatus } from "./useWorldSimulation";

type MapPanelProps = {
  status: SimulationStatus;
};

export function MapPanel({ status }: MapPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [senseActive, setSenseActive] = useState(false);
  const [trailActive, setTrailActive] = useState(false);

  useMissionMapCanvas(canvasRef);

  return (
    <section className="flex flex-col bg-bg border-r border-border overflow-hidden">
      {/* Map toolbar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border bg-bg-2 shrink-0">
        <span className="font-mono uppercase tracking-widest text-text-3 font-medium fz-2xs">
          map
        </span>
        <div className="flex-1" />
        <LayerButton label="sense" active={senseActive} onClick={() => setSenseActive((v) => !v)} />
        <LayerButton label="trail" active={trailActive} onClick={() => setTrailActive((v) => !v)} />
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />

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

function LayerButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono px-1.5 py-0.5 rounded-sm border cursor-pointer transition-all duration-100 fz-2xs ${
        active ? "border-teal text-teal bg-teal-dim" : "border-border text-text-3 bg-transparent"
      }`}
    >
      {label}
    </button>
  );
}
