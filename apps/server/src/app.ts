import { Hono } from "hono";
import { registry } from "./rivet/actors.ts";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.all("/api/rivet/*", (c) => registry.handler(c.req.raw));

export default app;
