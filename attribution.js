// Remembers how a visitor first reached the site so the lead email can say which article earned it.
// Vercel Analytics shows campaign tags in aggregate only; this carries them through to the individual
// lead. Loaded on every page, including /chat/, which is the one page that does not load script.js.
(function () {
  var KEY = "axhilles:attribution";
  var VERSION = 1;
  // Long enough that someone can read a piece one week and come back to talk the next.
  var WINDOW_DAYS = 90;
  var MAX_LEN = 300;

  // The referrer hostnames worth naming. Anything else is reported as its bare hostname.
  var NAMED_SOURCES = [
    [/(^|\.)linkedin\.com$/, "LinkedIn"],
    [/(^|\.)lnkd\.in$/, "LinkedIn"],
    [/(^|\.)google\./, "Google"],
    [/(^|\.)bing\.com$/, "Bing"],
    [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
    [/(^|\.)x\.com$/, "X"],
    [/(^|\.)t\.co$/, "X"],
    [/(^|\.)facebook\.com$/, "Facebook"],
    [/(^|\.)reddit\.com$/, "Reddit"],
    [/(^|\.)news\.ycombinator\.com$/, "Hacker News"],
    [/(^|\.)substack\.com$/, "Substack"],
    [/(^|\.)mail\.google\.com$/, "Gmail"],
    [/(^|\.)outlook\./, "Outlook"],
    [/(^|\.)slack\.com$/, "Slack"],
  ];

  function clip(value) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
  }

  function readStore() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== VERSION || !parsed.first) return null;
      var age = Date.now() - Date.parse(parsed.first.at);
      if (!isFinite(age) || age > WINDOW_DAYS * 86400000) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeStore(record) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(record));
    } catch (_) {
      // Private browsing or blocked storage. The current page's own touch still gets reported.
    }
  }

  function referrerHost() {
    var ref = document.referrer || "";
    if (!ref) return "";
    try {
      return new URL(ref).hostname;
    } catch (_) {
      return "";
    }
  }

  // utm_source is written by hand when the link is posted, so it arrives lowercase and inconsistent.
  var SOURCE_LABELS = {
    linkedin: "LinkedIn",
    google: "Google",
    bing: "Bing",
    x: "X",
    twitter: "X",
    facebook: "Facebook",
    reddit: "Reddit",
    substack: "Substack",
    newsletter: "Newsletter",
    email: "Email",
    direct: "Direct",
  };

  function labelFor(host) {
    for (var i = 0; i < NAMED_SOURCES.length; i += 1) {
      if (NAMED_SOURCES[i][0].test(host)) return NAMED_SOURCES[i][1];
    }
    return host.replace(/^www\./, "");
  }

  function currentTouch(params, host) {
    var utmSource = clip(params.get("utm_source"));
    var tidied = utmSource ? SOURCE_LABELS[utmSource.toLowerCase()] || utmSource : "";
    return {
      at: new Date().toISOString(),
      source: tidied || (host ? labelFor(host) : "Direct"),
      medium: clip(params.get("utm_medium")),
      campaign: clip(params.get("utm_campaign")),
      content: clip(params.get("utm_content")),
      term: clip(params.get("utm_term")),
      referrer: clip(document.referrer),
      landing: clip(location.pathname),
    };
  }

  var params = new URLSearchParams(location.search);
  var host = referrerHost();
  var stored = readStore();
  var tagged = !!(params.get("utm_source") || params.get("utm_medium") || params.get("utm_campaign"));
  var external = !!host && host !== location.hostname;
  // Internal clicks are not touches, and a later direct visit does not overwrite the campaign that
  // brought someone here the first time. A first-ever visit always counts, even when it is direct.
  var isTouch = tagged || external || !stored;

  var record = stored;
  if (isTouch) {
    var touch = currentTouch(params, host);
    record = stored
      ? { v: VERSION, first: stored.first, last: touch, touches: (stored.touches || 1) + 1 }
      : { v: VERSION, first: touch, last: touch, touches: 1 };
    writeStore(record);
  }

  window.axhillesAttribution = {
    get: function () {
      return record || null;
    },
  };
})();
