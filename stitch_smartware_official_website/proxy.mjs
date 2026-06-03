import http from "node:http";
import https from "node:https";

const LISTEN_PORT = 8787;
const TARGET_URL = new URL("https://api.deepseek.com/anthropic");

const server = http.createServer((req, res) => {
  // CORS for any local tooling
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  // Only proxy /anthropic/* paths
  const url = new URL(req.url, `http://localhost:${LISTEN_PORT}`);
  if (!url.pathname.startsWith("/anthropic")) {
    url.pathname = "/anthropic" + url.pathname;
  }

  // Collect body
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      res.writeHead(400).end("Invalid JSON");
      return;
    }

    // ── Transform: system → user ──
    // 1. If top-level "system" exists, prepend it as a user message
    if (body.system) {
      const systemContent = typeof body.system === "string"
        ? body.system
        : JSON.stringify(body.system);
      body.messages.unshift({
        role: "user",
        content: `[System]\n${systemContent}`,
      });
      delete body.system;
    }

    // 2. Rewrite any message with role "system" to "user"
    if (Array.isArray(body.messages)) {
      for (const msg of body.messages) {
        if (msg.role === "system") {
          msg.content = `[System]\n${msg.content}`;
          msg.role = "user";
        }
        // Strip thinking blocks — DeepSeek doesn't support them
        if (Array.isArray(msg.content)) {
          msg.content = msg.content.filter(
            (block) => block.type !== "thinking"
          );
          // If only one block left, unwrap to string
          if (msg.content.length === 1) {
            msg.content = msg.content[0].text ?? msg.content[0];
          }
          // If all blocks were thinking blocks, keep a placeholder
          if (msg.content.length === 0) {
            msg.content = "[thinking omitted]";
          }
        }
      }
    }

    // 3. Strip top-level thinking budget — prevent DeepSeek from returning thinking blocks
    if (body.thinking) {
      delete body.thinking;
    }

    const payload = JSON.stringify(body);

    const proxyReq = https.request({
      hostname: TARGET_URL.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: TARGET_URL.hostname,
        "content-length": Buffer.byteLength(payload),
      },
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err.message);
      if (!res.headersSent) res.writeHead(502).end("Bad Gateway");
    });

    proxyReq.write(payload);
    proxyReq.end();
  });
});

server.listen(LISTEN_PORT, () => {
  console.log(`Proxy running on http://localhost:${LISTEN_PORT}`);
  console.log(`Forwarding to ${TARGET_URL.href}`);
});
