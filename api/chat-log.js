const { clientIp, makeRateLimit, readBody, cleanMessages } = require("../lib/http");
const { logChatSession } = require("../lib/log-chat-question");

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const MAX_CHARS = 2000;
const MAX_HISTORY = 40;

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

  const reason =
    body.reason === "turn-limit" || body.reason === "inactive" || body.reason === "session-end"
      ? body.reason
      : "inactive";
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "chat";
  const transcript = cleanMessages(body.transcript, MAX_CHARS, MAX_HISTORY);
  const userTurns = transcript.filter((m) => m.role === "user").length;
  if (!userTurns) return res.status(204).end();

  const question =
    typeof body.question === "string" ? body.question.trim().slice(0, MAX_CHARS) : "";

  await logChatSession({
    question,
    turn: userTurns,
    transcript,
    reason,
    source,
  });
  return res.status(204).end();
};

module.exports.config = { maxDuration: 10 };
