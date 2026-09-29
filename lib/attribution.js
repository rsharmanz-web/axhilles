const MAX_LEN = 200;
const TOUCH_FIELDS = ["at", "source", "medium", "campaign", "content", "term", "referrer", "landing"];

// Everything here arrives from the browser and is printed straight into an email, so newlines are
// collapsed: without that, a crafted value could forge its own "SOURCE" or "CONTACT" section.
function clean(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
}

function cleanTouch(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  for (const field of TOUCH_FIELDS) out[field] = clean(raw[field]);
  if (!out.source && !out.campaign && !out.referrer && !out.landing) return null;
  return out;
}

function cleanAttribution(raw) {
  if (!raw || typeof raw !== "object") return null;
  const last = cleanTouch(raw.last);
  if (!last) return null;
  const first = cleanTouch(raw.first) || last;
  const touches = Number.isFinite(raw.touches) ? Math.min(Math.max(Math.trunc(raw.touches), 1), 9999) : 1;
  return { first, last, touches };
}

function day(iso) {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return "";
  return new Date(parsed).toISOString().slice(0, 10);
}

function sameEntryPoint(a, b) {
  return a.source === b.source && a.campaign === b.campaign && a.landing === b.landing;
}

function formatAttribution(attribution) {
  if (!attribution) return ["Came from: — (not captured)"];
  const { first, last, touches } = attribution;
  const lines = [
    `Came from: ${last.source || "—"}`,
    `Landed on: ${last.landing || "—"}`,
  ];
  if (last.campaign) lines.push(`Campaign: ${last.campaign}`);
  if (last.medium) lines.push(`Medium: ${last.medium}`);
  if (last.content) lines.push(`Content: ${last.content}`);
  if (last.term) lines.push(`Term: ${last.term}`);
  if (last.referrer) lines.push(`Referrer: ${last.referrer}`);
  if (touches > 1 && !sameEntryPoint(first, last)) {
    const when = day(first.at);
    lines.push(
      `First found us via: ${first.source || "—"} — ${first.landing || "—"}${when ? ` on ${when}` : ""}`
    );
  }
  if (touches > 1) lines.push(`Arrivals from outside: ${touches}`);
  return lines;
}

module.exports = { cleanAttribution, formatAttribution };
