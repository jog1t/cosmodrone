import { createRivetKit } from "@rivetkit/react";

// createRivetKit without the registry generic — actions are untyped at call
// sites but the runtime connection works correctly. Type-safe action calls are
// handled via explicit cast in useWorldSimulation.
export const { useActor } = createRivetKit();
