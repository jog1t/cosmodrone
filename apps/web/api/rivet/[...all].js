import { registry } from "./actors.ts";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  try {
    const origin = req.headers.host?.startsWith("localhost")
      ? `http://${req.headers.host}`
      : `https://${req.headers.host}`;
    const requestUrl = new URL(req.url, origin);

    const request = new Request(requestUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
    });

    const response = await registry.handler(request);

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key === "content-encoding" || key === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown handler error",
    });
  }
}
