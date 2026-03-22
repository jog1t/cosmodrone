import { useState } from "react";
import { BottomPanels } from "./mission-shell/BottomPanels";
import { AssemblerSidebar } from "./mission-shell/AssemblerSidebar";
import { InspectorSidebar } from "./mission-shell/InspectorSidebar";
import { MapPanel } from "./mission-shell/MapPanel";
import { TopBar } from "./mission-shell/TopBar";
import { useWorldSimulation } from "./mission-shell/useWorldSimulation";

function App() {
  const [showInspector, setShowInspector] = useState(true);
  const [showAssembler, setShowAssembler] = useState(true);
  const { isReady, world, reset, step, toggleRun } = useWorldSimulation();

  const mapColumns = `${showInspector ? "300px " : ""}minmax(0,1fr)${showAssembler ? " 400px" : ""}`;

  return (
    <main className="h-screen overflow-hidden bg-transparent text-slate-100">
      <section
        className="grid h-screen w-screen grid-rows-[84px_minmax(0,1fr)_160px] gap-px"
        style={{ background: "var(--panel-separator)" }}
      >
        <TopBar
          showAssembler={showAssembler}
          showInspector={showInspector}
          controlsDisabled={!isReady}
          world={world}
          onReset={reset}
          onStep={step}
          onToggleRun={toggleRun}
          toggleAssembler={() => setShowAssembler((value) => !value)}
          toggleInspector={() => setShowInspector((value) => !value)}
        />

        <div
          className="grid min-h-0 gap-px"
          style={{ gridTemplateColumns: mapColumns, background: "var(--panel-separator)" }}
        >
          {showInspector ? <InspectorSidebar world={world} /> : null}
          <MapPanel world={world} />
          {showAssembler ? <AssemblerSidebar /> : null}
        </div>

        <BottomPanels world={world} />
      </section>
    </main>
  );
}

export default App;
