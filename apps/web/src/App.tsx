import { useWorldSimulation } from "./mission-shell/useWorldSimulation";
import { mapSnapshotToUi } from "./mission-shell/actorWorld";
import { TopBar } from "./mission-shell/TopBar";
import { MapPanel } from "./mission-shell/MapPanel";
import { RightPanel } from "./mission-shell/RightPanel";
import { BottomStrip } from "./mission-shell/BottomStrip";

function App() {
  const sim = useWorldSimulation();
  const world = mapSnapshotToUi(sim.snapshot, sim.status);

  return (
    <div className="grid-shell">
      <TopBar
        tick={world.tick}
        status={world.status}
        objective={world.objective}
        isRunning={sim.isRunning}
        onRun={sim.start}
        onPause={sim.pause}
        onReset={sim.reset}
      />

      <div className="grid-main">
        <MapPanel
          status={world.status}
          depositVisibility={world.depositVisibility}
          drones={world.drones}
        />
        <RightPanel />
      </div>

      <BottomStrip status={world.status} />
    </div>
  );
}

export default App;
