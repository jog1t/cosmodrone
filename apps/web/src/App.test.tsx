import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: ({ defaultValue }: { defaultValue?: string }) => (
    <div data-testid="monaco-editor">{defaultValue}</div>
  ),
}));

import App from "./App";

describe("App", () => {
  it("renders the puzzle mode shell", () => {
    render(<App />);

    expect(screen.getByText(/First loop command deck/i)).toBeInTheDocument();
    expect(screen.getByText(/map renderer/i)).toBeInTheDocument();
    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
    expect(screen.getByText(/miner-alpha.ts/i)).toBeInTheDocument();
    expect(screen.getByText(/runtime feedback/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tab inspector/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /shift\+a assembler/i })).toBeInTheDocument();
  });
});
