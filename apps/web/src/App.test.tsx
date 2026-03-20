import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: ({ defaultValue }: { defaultValue?: string }) => (
    <div data-testid="monaco-editor">{defaultValue}</div>
  ),
}));

import App from "./App";

describe("App", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the puzzle mode shell", () => {
    render(<App />);

    expect(screen.getByText(/First loop command deck/i)).toBeInTheDocument();
    expect(screen.getByText(/map renderer/i)).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    expect(screen.getByText(/miner-alpha.ts/i)).toBeInTheDocument();
    expect(screen.getByText(/runtime feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tab inspector/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /shift\+a assembler/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /space play/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\. step/i })).toBeInTheDocument();
  });

  it("steps, runs, and resets the simulation clock", () => {
    vi.useFakeTimers();

    render(<App />);

    const tickCard = screen.getAllByText(/^Tick$/)[0]?.closest("article");
    expect(tickCard).not.toBeNull();
    if (!tickCard) {
      throw new Error("Tick card not found");
    }

    expect(within(tickCard).getByText(/^000$/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /\. step/i })[0]!);
    expect(within(tickCard).getByText(/^001$/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /space play/i })[0]!);

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(within(tickCard).getByText(/^003$/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /space pause/i })[0]).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /ctrl\+r reset/i })[0]!);
    expect(within(tickCard).getByText(/^000$/)).toBeInTheDocument();
  });
});
