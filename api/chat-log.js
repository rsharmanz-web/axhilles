const { clientIp, makeRateLimit, readBody } = require("../lib/http");
const { logChatQuestion } = require("../lib/log-chat-question");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const MAX_CHARS = 2000;

const rateLimit = makeRateLimit(WINDOW_MS, MAX_PER_WINDOW);

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!rateLimit(clientIp(req))) {
    return res.status(429).json({ ok: false, error: "Too many logs." });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: "Bad body." });
  }

  const question = typeof body.question === "string" ? body.question.trim().slice(0, MAX_CHARS) : "";
  if (!question) return res.status(400).json({ ok: false, error: "Question required." });

  const turn = Number.isFinite(body.turn) ? body.turn : null;
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "chat";

  // Fire-and-forget style: still await so Resend finishes in this invocation,
  // but never fail the visitor experience.
  await logChatQuestion({ question, turn, source });
  return res.status(204).end();
};

module.exports.config = { maxDuration: 10 };
