function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

function makeRateLimit(windowMs, maxPerWindow) {
  const hits = new Map();
  return function rateLimit(ip) {
    const now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    if (list.length >= maxPerWindow) {
      hits.set(ip, list);
      return false;
    }
    list.push(now);
    hits.set(ip, list);
    return true;
  };
}

function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body || "{}"));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function cleanMessages(raw, maxChars, maxHistory) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const content = typeof m.content === "string" ? m.content.trim() : "";
    if (!content) continue;
    out.push({ role: m.role, content: content.slice(0, maxChars) });
  }
  return out.slice(-maxHistory);
}

module.exports = { clientIp, makeRateLimit, readBody, cleanMessages };
