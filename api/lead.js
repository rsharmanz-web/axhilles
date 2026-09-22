const { clientIp, makeRateLimit, readBody, cleanMessages } = require("../lib/http");
const { parseLeadSummary } = require("../lib/parse-summary");
const { saveLead } = require("../lib/save-lead");

const MODEL = "claude-haiku-4-5";
const MAX_CHARS = 2000;
const MAX_HISTORY = 40;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rateLimit = makeRateLimit(WINDOW_MS, MAX_PER_WINDOW);

function bad(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

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
    return bad(res, 429, "Too many tries. Give it a few minutes.");
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return bad(res, 400, "Could not read that form.");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const business = typeof body.business === "string" ? body.business.trim() : "";
  const openerVariant = typeof body.openerVariant === "string" ? body.openerVariant.trim() : "";
  if (!name) return bad(res, 400, "Name is required.");
  if (!EMAIL_RE.test(email)) return bad(res, 400, "A valid email is required.");
  if (!body.consent) return bad(res, 400, "Consent is required.");

  const transcript = cleanMessages(body.transcript, MAX_CHARS, MAX_HISTORY);
  const timestamp = new Date().toISOString();

  let summary = null;
  let summaryFailed = true;
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && transcript.length) {
    try {
      const { LEAD_SUMMARY_PROMPT } = await import("../lib/lead-summary-prompt.js");
      const transcriptText = transcript
        .map((m) => (m.role === "assistant" ? "Mascot" : "Visitor") + ": " + m.content)
        .join("\n");
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 800,
          system: LEAD_SUMMARY_PROMPT,
          messages: [
            {
              role: "user",
              content: "Summarise this transcript:\n\n" + transcriptText,
            },
          ],
        }),
      });
      const data = await upstream.json();
      const raw = Array.isArray(data.content)
        ? data.content.map((c) => c.text || "").join("")
        : "";
      const parsed = parseLeadSummary(raw);
      summary = parsed.summary;
      summaryFailed = parsed.summaryFailed;
    } catch (err) {
      console.error("LEAD_SUMMARY_FAIL", err && err.message ? err.message : err);
      summaryFailed = true;
    }
  }

  const lead = {
    name,
    email,
    business,
    consent: true,
    openerVariant,
    timestamp,
    transcript,
    summary,
    summaryFailed,
  };

  await saveLead(lead);
  return res.status(200).json({ ok: true });
};

module.exports.config = { maxDuration: 30 };
