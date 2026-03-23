import { serve } from "@hono/node-server";
import { registry } from "./rivet/actors";

const port = Number(process.env.PORT ?? 8080);

serve({
  fetch: registry.serve().fetch,
  port,
});

console.log(`Cosmodrone server listening on http://localhost:${port}`);
