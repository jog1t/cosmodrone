import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@rivetkit/react", () => ({
  createRivetKit: () => ({
    useActor: () => ({
      connStatus: "connected",
      connection: {
        getSnapshot: vi.fn().mockResolvedValue({
          phase: "lobby",
          roomCode: "hangar-alpha",
          population: 1,
          players: {
            "pilot-test": {
              x: 50,
              y: 50,
              vx: 0,
              vy: 0,
              hue: 180,
              ready: false,
              online: true,
              displayName: "Pilot TEST",
            },
          },
        }),
        syncVector: vi.fn(),
        toggleReady: vi.fn(),
      },
      useEvent: vi.fn(),
    }),
  }),
}));

import App from "./App";

describe("App", () => {
  it("renders the scaffold headline and workspace commands", () => {
    render(<App />);

    expect(screen.getByText(/Rivet-powered dogfight scaffolding/i)).toBeInTheDocument();
    expect(screen.getByText("`pnpm dev`", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/Shared drone room actor/i)).toBeInTheDocument();
  });
});
