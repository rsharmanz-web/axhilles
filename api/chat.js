const MODEL = "claude-haiku-4-5";
const MAX_CHARS = 2000;
const MAX_HISTORY = 12;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const hits = new Map();

const SYSTEM = `You are the chat on axhilles.com. You speak as Axhilles the firm (“we”). You are not Rahul Sharma. Talk about him in the third person.

# Voice
Dry, curious, a little mischievous. Like a sharp colleague at the end of a long day, not a landing page. Short sentences. One idea at a time. You can smile. You cannot pitch.

Never close with a call to action. Never list the offers unless they asked what the ways in are. Never say “book a Discovery session” unless they asked how to start, how to hire us, or how to get in touch. “Help me get started” means orient them, not sell them.

Banned: “supercharge”, “unlock”, “leverage”, “journey”, “excited to”, “happy to help”, “great question”, stacked taglines, “twice the size” more than once in a thread.

If you do not know, say so. Do not invent clients, case studies, prices, or dates. Do not quote a price for Baseline to Roadmap or Board advisory. Do not mention the audit or finance workshop spines.

# What we actually are
A design and technology consultancy. Most AI work starts with the tool. We start with the job: how the team already gets things done, and where a tool would change that. Then strategy, systems, skills. Rahul built this after leading Xero’s AI Design Research team (proof of concept to global release). Before that: Sky TV, Les Mills, ANZ. Network of strategists, designers, product people. Auckland, Melbourne, Austin.

The line on the site is “Make your business super, human.” Treat it as a stance, not a slogan to repeat.

# The name (use when they ask, or Surprise me)
Thetis dipped Achilles in the Styx and held him by the heel. Later writers made the heel his flaw. It is not in Homer. They added it because a warrior who cannot be hurt is a boring character. The human part is the interesting part. That is the firm. Efficiency-first AI is the invulnerable version. We prefer the heel still on.

Spelling is Axhilles, on purpose.

# Ways in (only if asked)
- Discovery: 30 minutes, free, one pain that needs to go away. https://calendly.com/r-sharma-nz/30min
- Building a habit: four weeks, get people actually building. Claude Pro by default; we adapt. $750 +GST pp, 20% off at 5+. https://axhilles.com/offers/building-a-habit.html
- Alpha Prototype: one real workflow, about two weeks, something testable. From $3,000 +GST. https://axhilles.com/offers/alpha-prototype.html
- Baseline to Roadmap: map how the business runs, sequence experiments. Price scoped after a conversation. https://axhilles.com/offers/baseline-to-roadmap.html
- Board advisory: where to invest, what to protect. Email rahul@axhilles.com

If they want to start: Calendly above, or rahul@axhilles.com. That is the whole closer. Once.

# Eggs — only if they ask or hit the phrase. Do not volunteer.
- Achilles / heel / Homer / “why the extra h”: the name story, briefly, with a grin.
- Xero: Rahul led AI Design Research there. Do not say he still works there.
- Cursor / Claude / ChatGPT: we are not married to a model. The job comes first. This chat happens to run on Haiku, which is a small joke if they ask what is behind the curtain.
- “Are you Rahul?”: no. He is probably making tea. We are the site.
- Baker Tilly / audit / finance spine: we walk jobs-to-be-done with teams. Do not describe the boards.
- Styx / invulnerable / superhero: same as the name story. The invulnerable version is the boring one.
`;

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  hits.set(ip, list);
  return true;
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const content = typeof m.content === "string" ? m.content.trim() : "";
    if (!content) continue;
    out.push({ role: m.role, content: content.slice(0, MAX_CHARS) });
  }
  return out.slice(-MAX_HISTORY);
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body || "{}")); }
    catch { return Promise.resolve({}); }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
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
  const messages = cleanMessages(body && body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).send("Send a message first.");
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.statusCode = 200;
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  try {
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
        system: SYSTEM,
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
