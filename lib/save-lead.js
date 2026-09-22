const failedLeads = [];

function truncate(text, n) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

function formatSummary(summary) {
  if (!summary || typeof summary !== "object") return "";
  const lines = [
    ["Task", summary.task],
    ["Hours per week", summary.hours_per_week],
    ["Team scope", summary.team_scope],
    ["Business type", summary.business_type],
    ["Verdict", summary.verdict],
    ["Tip given", summary.tip_given],
    [
      "Visitor concerns",
      Array.isArray(summary.visitor_concerns)
        ? summary.visitor_concerns.join("; ")
        : summary.visitor_concerns,
    ],
    ["Tone", summary.tone],
  ];
  return lines
    .map(([label, value]) => {
      if (value == null || value === "") return `${label}: —`;
      return `${label}: ${value}`;
    })
    .join("\n");
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

function buildEmail(lead) {
  const task = lead.summary && lead.summary.task ? lead.summary.task : "unspecified task";
  const subject = `New Axhilles lead: ${lead.name} – ${truncate(task, 60)}`;
  const contact = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Business: ${lead.business || "—"}`,
  ].join("\n");

  const parts = [
    "CONTACT",
    contact,
    "",
    "CALL PREP",
    lead.summaryFailed
      ? "Summary failed. Use the transcript below."
      : (lead.summary && lead.summary.call_prep) || "—",
    "",
    "SUMMARY",
    lead.summaryFailed ? "Could not parse the model summary." : formatSummary(lead.summary),
    "",
    "META",
    `Opener variant: ${lead.openerVariant || "—"}`,
    `Timestamp: ${lead.timestamp}`,
    "",
    "TRANSCRIPT",
    formatTranscript(lead.transcript),
  ];

  return { subject, text: parts.join("\n") };
}

function keepLead(lead, reason) {
  const copy = { ...lead, keptAt: new Date().toISOString(), keepReason: reason || "unknown" };
  failedLeads.push(copy);
  console.error("LEAD_KEEP", JSON.stringify(copy));
  return copy;
}

async function sendResend({ from, to, replyTo, subject, text }) {
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
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error("Resend " + res.status + ": " + body.slice(0, 400));
  return body;
}

async function saveLead(lead) {
  const to = process.env.LEAD_EMAIL_TO || "rahul@axhilles.com";
  const from = process.env.LEAD_EMAIL_FROM || "hello@axhilles.com";
  const { subject, text } = buildEmail(lead);

  try {
    await sendResend({
      from,
      to,
      replyTo: lead.email,
      subject,
      text,
    });
    return { ok: true };
  } catch (err) {
    console.error("LEAD_EMAIL_FAIL", err && err.message ? err.message : err);
    keepLead(lead, err && err.message ? err.message : "email_failed");
    return { ok: false };
  }
}

module.exports = { saveLead, keepLead, failedLeads, buildEmail };
