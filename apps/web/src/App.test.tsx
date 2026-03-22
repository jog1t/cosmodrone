import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const actorMocks = vi.hoisted(() => {
  let tick = 0;

  const createSnapshot = (nextTick: number) => ({
    tick: nextTick,
    phase: "resolved",
    tickTimeoutMs: 450,
    droneIds: ["drone_01"],
    waitingOn: [],
    responses: {
      drone_01: {
        tick: nextTick,
        droneId: "drone_01",
        status: "ok",
        intent: { type: "idle" },
        logs: [`[${nextTick.toString().padStart(3, "0")}] drone_01 :: ready for next tick`],
        error: null,
        memory: { lastCompletedTick: nextTick },
      },
    },
    readyForNextTick: true,
  });

  return {
    playerConnection: {
      updateDroneScript: vi.fn(async () => ({
        playerId: "player-alpha",
        displayName: "Player ALPHA",
        droneIds: ["drone_01"],
        scripts: { drone_01: "code" },
      })),
    },
    systemConnection: {
      bootstrapSoloSession: vi.fn(async () => ({
        sessionId: "solo-mission",
        playerIds: ["player-alpha"],
        droneIds: ["drone_01"],
      })),
    },
    worldConnection: {
      getSnapshot: vi.fn(async () => createSnapshot(tick)),
      resetWorld: vi.fn(async () => {
        tick = 0;
        return createSnapshot(tick);
      }),
      runTick: vi.fn(async () => {
        tick += 1;
        return createSnapshot(tick);
      }),
    },
    reset() {
      tick = 0;
      this.playerConnection.updateDroneScript.mockClear();
      this.systemConnection.bootstrapSoloSession.mockClear();
      this.worldConnection.getSnapshot.mockClear();
      this.worldConnection.resetWorld.mockClear();
      this.worldConnection.runTick.mockClear();
    },
  };
});

vi.mock("@monaco-editor/react", () => ({
  default: ({ defaultValue }: { defaultValue?: string }) => (
    <div data-testid="monaco-editor">{defaultValue}</div>
  ),
}));

vi.mock("./rivet", () => ({
  client: {
    system: {
      getOrCreate: () => actorMocks.systemConnection,
    },
    player: {
      getOrCreate: () => actorMocks.playerConnection,
    },
    world: {
      getOrCreate: () => actorMocks.worldConnection,
    },
  },
}));

import App from "./App";

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
    actorMocks.reset();
  });

  it("renders the puzzle mode shell", async () => {
    render(<App />);

    await vi.waitFor(() => {
      expect(screen.getByText(/First loop command deck/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/map renderer/i)).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    expect(screen.getByText(/miner-alpha.ts/i)).toBeInTheDocument();
    expect(screen.getByText(/runtime feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tab inspector/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /shift\+a assembler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /space play/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\. step/i })).toBeInTheDocument();
  });

  it("steps, runs, and resets through the world actor", async () => {
    vi.useFakeTimers();

    render(<App />);

    await act(async () => {
      await Promise.resolve();
    });

    const tickCard = screen.getAllByText(/^Tick$/)[0]!;
    const tickPanel = tickCard.closest("article");
    expect(tickPanel).not.toBeNull();
    if (!tickPanel) {
      throw new Error("Tick card not found");
    }

    expect(within(tickPanel).getByText(/^000$/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /\. step/i })[0]!);
    });

    expect(within(tickPanel).getByText(/^001$/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /space play/i })[0]!);

    await act(async () => {
      vi.advanceTimersByTime(900);
      await Promise.resolve();
    });

    expect(within(tickPanel).getByText(/^003$/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /space pause/i })[0]).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /ctrl\+r reset/i })[0]!);
    });

    expect(within(tickPanel).getByText(/^000$/)).toBeInTheDocument();
    expect(actorMocks.systemConnection.bootstrapSoloSession).toHaveBeenCalledTimes(1);
    expect(actorMocks.playerConnection.updateDroneScript).toHaveBeenCalledTimes(1);
    expect(actorMocks.worldConnection.runTick).toHaveBeenCalledTimes(3);
    expect(actorMocks.worldConnection.resetWorld).toHaveBeenCalledTimes(1);
  });
});
