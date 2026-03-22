import { createRivetKit } from "@rivetkit/react";
import type { registry } from "@cosmodrone/server/src/rivet/actors";

export const { useActor } = createRivetKit<typeof registry>();
