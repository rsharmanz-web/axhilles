// Reads article metadata straight out of the article HTML, so the meta tags stay the single
// source of truth for the feed, the sitemap and the link-preview images.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export const SITE = "https://axhilles.com";
export const ARTICLES_DIR = "articles";

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&rsquo;": "\u2019",
  "&lsquo;": "\u2018",
  "&rdquo;": "\u201d",
  "&ldquo;": "\u201c",
  "&hellip;": "\u2026",
  "&middot;": "\u00b7",
  "&nbsp;": " ",
};

export function decodeEntities(text) {
  return String(text).replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? m);
}

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Matches <meta property="x" content="y"> and <meta content="y" property="x">. The quote character
// is captured and backreferenced so a value containing an apostrophe is not cut short.
function readMeta(html, key) {
  const attr = key.startsWith("og:") || key.startsWith("article:") ? "property" : "name";
  const patterns = [
    new RegExp(`<meta[^>]+${attr}=(["'])${key}\\1[^>]+content=(["'])((?:(?!\\2).)*)\\2`, "i"),
    new RegExp(`<meta[^>]+content=(["'])((?:(?!\\1).)*)\\1[^>]+${attr}=(["'])${key}\\3`, "i"),
  ];
  const valueGroup = [3, 2];
  for (let i = 0; i < patterns.length; i += 1) {
    const match = html.match(patterns[i]);
    if (match) return decodeEntities(match[valueGroup[i]]).trim();
  }
  return null;
}

function isNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);
}

export async function loadArticles(root = process.cwd()) {
  const dir = join(root, ARTICLES_DIR);
  const names = (await readdir(dir))
    .filter((n) => n.endsWith(".html"))
    .filter((n) => n !== "index.html" && !n.startsWith("_"));

  const articles = [];
  const problems = [];

  for (const name of names) {
    const slug = name.replace(/\.html$/, "");
    const html = await readFile(join(dir, name), "utf8");

    if (isNoindex(html)) continue;

    const title = readMeta(html, "og:title");
    const description = readMeta(html, "og:description");
    const date = readMeta(html, "article:published_time");
    const series = readMeta(html, "axhilles:series");

    const missing = [
      !title && "og:title",
      !description && "og:description",
      !date && "article:published_time",
    ].filter(Boolean);

    if (missing.length) {
      problems.push(`${name}: missing ${missing.join(", ")}`);
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      problems.push(`${name}: article:published_time must be YYYY-MM-DD, got "${date}"`);
      continue;
    }

    articles.push({
      slug,
      file: `${ARTICLES_DIR}/${name}`,
      url: `${SITE}/${ARTICLES_DIR}/${name}`,
      title,
      description,
      date,
      series: series ? Number(series) : null,
    });
  }

  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return { articles, problems };
}
