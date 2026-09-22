function stripFences(raw) {
  const text = String(raw || "").trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

function parseLeadSummary(raw) {
  try {
    const parsed = JSON.parse(stripFences(raw));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { summary: null, summaryFailed: true };
    }
    return { summary: parsed, summaryFailed: false };
  } catch {
    return { summary: null, summaryFailed: true };
  }
}

module.exports = { parseLeadSummary, stripFences };
