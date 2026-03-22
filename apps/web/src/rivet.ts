import { createRivetKit } from "@rivetkit/react";
import type { registry } from "server/src/rivet/actors";

export const { useActor } = createRivetKit<typeof registry>();
