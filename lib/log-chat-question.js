const failedChatLogs = [];

function truncate(text, n) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function formatTranscript(transcript) {
  if (!Array.isArray(transcript) || !transcript.length) return "(empty)";
  return transcript
    .map((m) => {
      const role = m.role === "assistant" ? "Mascot" : "Visitor";
      return `${role}: ${m.content || ""}`;
    })
    .join("\n\n");
}

function firstUserQuestion(transcript) {
  if (!Array.isArray(transcript)) return "";
  const hit = transcript.find((m) => m && m.role === "user" && m.content);
  return hit ? String(hit.content).trim() : "";
}

function buildChatLogEmail({ question, turn, transcript, reason, timestamp, source }) {
  const firstQ = question || firstUserQuestion(transcript);
  const label = reason === "turn-limit" ? "turn limit" : "session end";
  const subject = `Chax session (${label}): ${truncate(firstQ || "chat", 60)}`;
  const text = [
    "CHAX SESSION",
    `Reason: ${reason || "session-end"}`,
    `First question: ${firstQ || "—"}`,
    `User turns: ${turn || "—"}`,
    `Source: ${source || "chat"}`,
    `Timestamp: ${timestamp || new Date().toISOString()}`,
    "",
    "TRANSCRIPT",
    formatTranscript(transcript),
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

async function logChatSession({ question, turn, transcript, reason, source }) {
  const q = typeof question === "string" ? question.trim() : firstUserQuestion(transcript);
  if (!q && !(Array.isArray(transcript) && transcript.some((m) => m && m.role === "user"))) {
    return { ok: false, skipped: true };
  }

  const to = process.env.CHAT_LOG_EMAIL_TO || process.env.LEAD_EMAIL_TO || "rahul@axhilles.com";
  const from = process.env.LEAD_EMAIL_FROM || "hello@axhilles.com";
  const timestamp = new Date().toISOString();
  const { subject, text } = buildChatLogEmail({
    question: q,
    turn,
    transcript,
    reason,
    timestamp,
    source,
  });

  console.log(
    "CHAT_SESSION",
    JSON.stringify({
      question: q,
      turn,
      reason,
      source,
      timestamp,
      messages: Array.isArray(transcript) ? transcript.length : 0,
    })
  );

  try {
    await sendResend({ from, to, subject, text });
    return { ok: true };
  } catch (err) {
    const keep = {
      question: q,
      turn,
      reason,
      source,
      transcript,
      timestamp,
      keptAt: new Date().toISOString(),
      keepReason: err && err.message ? err.message : "email_failed",
    };
    failedChatLogs.push(keep);
    console.error("CHAT_SESSION_KEEP", JSON.stringify(keep));
    return { ok: false };
  }
}

// Back-compat alias used by older call sites / tests.
async function logChatQuestion(args) {
  return logChatSession(args);
}

module.exports = {
  logChatSession,
  logChatQuestion,
  buildChatLogEmail,
  formatTranscript,
  firstUserQuestion,
  failedChatLogs,
};
