import { useState } from "react";
import type { SimulationStatus } from "./useWorldSimulation";

type BottomStripProps = {
  status: SimulationStatus;
};

type StripTab = "Console" | "Timeline";

const MOCK_LOGS = [
  { tick: "007", drone: "#1", msg: "adjacent — mining" },
  { tick: "006", drone: "#1", msg: "moving to ore cluster" },
  { tick: "005", drone: "#1", msg: "stored 2 ore at base" },
  { tick: "004", drone: "#1", msg: "battery low — returning" },
];

const MOCK_TIMELINE = [
  { tick: "001", label: "launch", color: "bg-teal" },
  { tick: "002", label: "move", color: "bg-teal" },
  { tick: "003", label: "mine", color: "bg-amber" },
  { tick: "004", label: "store", color: "bg-teal" },
  { tick: "005", label: "return", color: "bg-teal" },
  { tick: "006", label: "move", color: "bg-teal" },
  { tick: "007", label: "mine", color: "bg-amber" },
];

export function BottomStrip({ status }: BottomStripProps) {
  const [activeTab, setActiveTab] = useState<StripTab>("Console");
  const [droneFilter, setDroneFilter] = useState<"all" | "#1" | "#2">("all");

  const expanded = status === "failed";

  return (
    <div
      className={`fixed bottom-0 left-0 right-panel flex flex-col border-t border-border overflow-hidden z-50 transition-[height] duration-250 ease-in-out bg-[rgba(10,12,19,0.97)] backdrop-blur-sm ${
        expanded ? "h-bottom-strip" : "h-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center px-3 shrink-0 border-b border-border gap-2 h-7">
        {(["Console", "Timeline"] as StripTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono uppercase tracking-widest font-medium cursor-pointer px-1 transition-colors duration-100 fz-2xs ${
              activeTab === tab ? "text-text-2" : "text-text-3"
            }`}
          >
            {tab}
          </button>
        ))}

        <div className="flex-1" />

        {activeTab === "Console" && (
          <div className="flex gap-1">
            {(["all", "#1", "#2"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setDroneFilter(f)}
                className={`font-mono px-1.5 py-0.5 rounded-sm border cursor-pointer transition-all duration-100 fz-2xs ${
                  droneFilter === f
                    ? "border-border-2 text-text-2 bg-bg-4"
                    : "border-border text-text-3 bg-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-1.5">
        {activeTab === "Console" && (
          <div className="flex flex-col gap-0.5">
            {MOCK_LOGS.filter((l) => droneFilter === "all" || l.drone === droneFilter).map(
              (l, i) => (
                <div key={i} className="font-mono text-text-2 leading-relaxed fz-xs">
                  <span className="text-text-3">tick {l.tick}</span>
                  {" · "}
                  <span className="text-teal">{l.drone}</span>
                  {" · "}
                  {l.msg}
                </div>
              ),
            )}
          </div>
        )}

        {activeTab === "Timeline" && (
          <div className="flex items-center gap-1 pt-2">
            {MOCK_TIMELINE.map((e, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full cursor-pointer shrink-0 ${e.color}`}
                  title={`tick ${e.tick} — ${e.label}`}
                />
                <span className="font-mono text-text-3 fz-2xs">{e.tick}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
