import { serve } from "@hono/node-server";
import app from "./app.ts";

const port = Number(process.env.PORT ?? 6420);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Cosmodrone server listening on http://localhost:${port}`);
