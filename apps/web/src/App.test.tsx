import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the mission shell", () => {
    render(<App />);

    // Top bar
    expect(screen.getByText(/First Loop/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliver 15 ore/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RUN/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();

    // Map panel
    expect(screen.getByText(/^map$/i)).toBeInTheDocument();

    // Right panel
    expect(screen.getByRole("button", { name: /MINER/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Code/i })).toBeInTheDocument();
  });
});
