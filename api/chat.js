const { clientIp, makeRateLimit, readBody, cleanMessages } = require("../lib/http");
const { fillMascotPrompt } = require("../lib/placeholders");

const MODEL = "claude-haiku-4-5";
const MAX_CHARS = 2000;
const MAX_HISTORY = 30;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const rateLimit = makeRateLimit(WINDOW_MS, MAX_PER_WINDOW);

let systemPrompt = null;
async function getSystemPrompt() {
  if (systemPrompt) return systemPrompt;
  const { MASCOT_SYSTEM_PROMPT } = await import("../lib/mascot-prompt.js");
  systemPrompt = fillMascotPrompt(MASCOT_SYSTEM_PROMPT);
  return systemPrompt;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).send("Method not allowed");
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).send("Chat is not configured yet.");

  if (!rateLimit(clientIp(req))) {
    return res.status(429).send("Too many messages. Try again in a few minutes.");
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return res.status(400).send("Send a message first.");
  }
  const messages = cleanMessages(body && body.messages, MAX_CHARS, MAX_HISTORY);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).send("Send a message first.");
  }
  if (messages.length > MAX_HISTORY) {
    return res.status(400).send("This chat is long enough. Book a chat instead.");
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.statusCode = 200;
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  try {
    const system = await getSystemPrompt();
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        system,
        messages,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      if (!res.headersSent) {
        return res.status(upstream.status === 429 ? 429 : 502).send(
          upstream.status === 429
            ? "The model is busy. Try again in a moment."
            : "Could not reach the model."
        );
      }
      res.write(errText.slice(0, 200) || "Could not reach the model.");
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split("\n");
      buffer = chunks.pop() || "";
      for (const line of chunks) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let evt;
        try {
          evt = JSON.parse(payload);
        } catch {
          continue;
        }
        if (evt.type === "content_block_delta" && evt.delta && evt.delta.text) {
          res.write(evt.delta.text);
        }
      }
    }
    res.end();
  } catch (err) {
    if (!res.writableEnded) {
      if (!res.headersSent) res.status(500);
      res.end("Something went wrong. Please try again.");
    }
  }
};

module.exports.config = { maxDuration: 30 };
