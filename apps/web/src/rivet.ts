import { createRivetKit } from "@rivetkit/react";
import type { registry } from "@cosmodrone/server";

export const { useActor } = createRivetKit<typeof registry>();
