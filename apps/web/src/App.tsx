import { useState } from "react";
import { BottomPanels } from "./mission-shell/BottomPanels";
import { AssemblerSidebar } from "./mission-shell/AssemblerSidebar";
import { InspectorSidebar } from "./mission-shell/InspectorSidebar";
import { MapPanel } from "./mission-shell/MapPanel";
import { TopBar } from "./mission-shell/TopBar";

function App() {
  const [showInspector, setShowInspector] = useState(true);
  const [showAssembler, setShowAssembler] = useState(true);

  const mapColumns = `${showInspector ? "320px " : ""}minmax(0,1fr)${showAssembler ? " 420px" : ""}`;

  return (
    <main className="h-screen overflow-hidden bg-transparent text-slate-100">
      <section className="grid h-screen w-screen grid-rows-[92px_minmax(0,1fr)_172px] gap-[1px] bg-[rgba(86,156,214,0.18)] p-[1px]">
        <TopBar
          showAssembler={showAssembler}
          showInspector={showInspector}
          toggleAssembler={() => setShowAssembler((value) => !value)}
          toggleInspector={() => setShowInspector((value) => !value)}
        />

        <div
          className="grid min-h-0 gap-[1px] bg-[rgba(86,156,214,0.18)]"
          style={{ gridTemplateColumns: mapColumns }}
        >
          {showInspector ? <InspectorSidebar /> : null}
          <MapPanel />
          {showAssembler ? <AssemblerSidebar /> : null}
        </div>

        <BottomPanels />
      </section>
    </main>
  );
}

export default App;
