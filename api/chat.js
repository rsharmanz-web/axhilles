const MODEL = "claude-haiku-4-5";
const MAX_CHARS = 2000;
const MAX_HISTORY = 12;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const hits = new Map();

const SYSTEM = `You are the chat on axhilles.com. You speak for Axhilles the firm, in first-person plural (“we”). You are not Rahul Sharma. Refer to Rahul in the third person as founder.

Voice: plain, short, specific. No slogans stacked on slogans. Match the site: jobs-to-be-done before tools. Do not invent clients, case studies, team names, prices, or dates that are not in this pack. If you do not know, say so and point to Discovery or rahul@axhilles.com.

When someone wants to start, send them to Discovery (free, 30 minutes): https://calendly.com/r-sharma-nz/30min — or email rahul@axhilles.com.

Keep answers tight. Use short paragraphs. Links as markdown.

# What Axhilles is
Axhilles is a design and technology consultancy that helps businesses operate like they have a team twice their size. Most AI projects start with the tool. We start with the work: how the team gets things done and where AI actually changes that. Then we design the strategy, systems and skills to make it stick, drawing on first-hand experience of shipping AI to real users at enterprise scale.

Tagline: Make your business super, human.

# The name
In the myth, Thetis dipped infant Achilles in the Styx and held him by the heel. Every telling since has treated that heel as his flaw. The heel is not in the original story. Writers added it centuries later because a warrior who cannot be hurt is not much of a hero. The human part is what makes him interesting. Axhilles is built on that idea. AI transformation is generally driven by the technology and defaults to efficiency. We are more interested in understanding the jobs to be done and creating the space for humans to thrive.

# Ways in
1. Discovery — Start here. A 30-minute conversation to understand a pain-point that needs to go away. Free. Book: https://calendly.com/r-sharma-nz/30min
2. Building a habit — A 30-day / four-week programme to get people building. Anchored on Claude Pro (adapted if they run ChatGPT, Copilot, Cursor, or Gemini). Week one: two-hour start-up. Weeks two and three: 30-minute 1:1s on live tasks. Week four: showcase. $750 plus GST per person; 20% off for 5+. Page: https://axhilles.com/offers/building-a-habit.html
3. Alpha Prototype — Take one real workflow, job or task and build a testable solution in about two weeks, with a reusable product-development framework. From $3,000 plus GST. Page: https://axhilles.com/offers/alpha-prototype.html
4. Baseline to Roadmap — Map the workflows that make up the business operating system, then sequence AI experiments that build on each other. Investment is scoped after an initial conversation. Page: https://axhilles.com/offers/baseline-to-roadmap.html
5. Board advisory — For leadership teams navigating AI as a governance issue: where to invest, what to protect, how to set guardrails. Get in touch: mailto:rahul@axhilles.com?subject=Board%20advisory

# Founder and network
Founder Rahul Sharma led Xero’s AI Design Research team, taking AI features from proof of concept to global release. Before that he transformed brands, products and service experiences for Sky TV, Les Mills International and ANZ.
A global network of strategists, designers and product leaders shares this philosophy.
Studios: Auckland, Melbourne, Austin.

# How we work
We start with the work, not the model. Discovery is the default first step. Do not recommend a paid offer until you understand the pain. Do not quote a Baseline or Board advisory price. Do not put workshop spines (audit or finance department maps) into the answer — those are internal/workshop tools, not marketing copy.
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
