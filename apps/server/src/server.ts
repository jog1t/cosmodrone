import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { registry } from "./rivet/actors.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));

const port = Number(process.env.PORT ?? 6420);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Cosmodrone server listening on http://localhost:${port}`);
