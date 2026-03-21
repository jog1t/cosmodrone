import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { registry } from "./rivet/actors";

const port = Number(process.env.PORT ?? 6420);
const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.all("/*", (c) => registry.handler(c.req.raw));

serve({ fetch: app.fetch, port });

console.log(`Cosmodrone runner listening on http://localhost:${port}`);
