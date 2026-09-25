const failedChatLogs = [];

function truncate(text, n) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function buildChatLogEmail({ question, turn, timestamp, source }) {
  const subject = `Chax question: ${truncate(question, 70)}`;
  const text = [
    "CHAX QUESTION",
    `Question: ${question}`,
    `Turn: ${turn || "—"}`,
    `Source: ${source || "chat"}`,
    `Timestamp: ${timestamp || new Date().toISOString()}`,
  ].join("\n");
  return { subject, text };
}

async function sendResend({ from, to, subject, text }) {
  const key = process.env.EMAIL_API_KEY;
  if (!key) throw new Error("EMAIL_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error("Resend " + res.status + ": " + body.slice(0, 400));
  return body;
}

async function logChatQuestion({ question, turn, source }) {
  const q = typeof question === "string" ? question.trim() : "";
  if (!q) return { ok: false, skipped: true };

  const to = process.env.CHAT_LOG_EMAIL_TO || process.env.LEAD_EMAIL_TO || "rahul@axhilles.com";
  const from = process.env.LEAD_EMAIL_FROM || "hello@axhilles.com";
  const timestamp = new Date().toISOString();
  const { subject, text } = buildChatLogEmail({
    question: q,
    turn,
    timestamp,
    source,
  });

  // Always leave a server log trail in Vercel.
  console.log("CHAT_QUESTION", JSON.stringify({ question: q, turn, source, timestamp }));

  try {
    await sendResend({ from, to, subject, text });
    return { ok: true };
  } catch (err) {
    const keep = {
      question: q,
      turn,
      source,
      timestamp,
      keptAt: new Date().toISOString(),
      keepReason: err && err.message ? err.message : "email_failed",
    };
    failedChatLogs.push(keep);
    console.error("CHAT_QUESTION_KEEP", JSON.stringify(keep));
    return { ok: false };
  }
}

module.exports = {
  logChatQuestion,
  buildChatLogEmail,
  failedChatLogs,
};
