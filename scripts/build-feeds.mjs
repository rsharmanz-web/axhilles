// Writes rss.xml and sitemap.xml from the article meta tags.
//
//   node scripts/build-feeds.mjs
//
// Run it after adding, renaming or dating an article.

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE, escapeXml, loadArticles } from "./articles.mjs";

// Public pages that are not articles. /pitch/ and /spine/ are deliberately absent: the pitch page
// is noindex and the spine boards are workshop tools, not marketing pages.
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/articles/", priority: "0.9", changefreq: "weekly" },
  { path: "/readings/", priority: "0.6", changefreq: "monthly" },
  { path: "/offers/building-a-habit.html", priority: "0.8", changefreq: "monthly" },
  { path: "/offers/alpha-prototype.html", priority: "0.8", changefreq: "monthly" },
  { path: "/offers/baseline-to-roadmap.html", priority: "0.8", changefreq: "monthly" },
  { path: "/chat/", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy/", priority: "0.3", changefreq: "yearly" },
];

function rfc822(date) {
  return new Date(`${date}T09:00:00+13:00`).toUTCString();
}

function buildRss(articles) {
  const now = new Date().toUTCString();
  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${a.url}</link>
      <guid isPermaLink="true">${a.url}</guid>
      <pubDate>${rfc822(a.date)}</pubDate>
      <description>${escapeXml(a.description)}</description>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Axhilles — Articles</title>
    <link>${SITE}/articles/</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>What actually changes when a service business puts AI to work — and what doesn't.</description>
    <language>en-nz</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function buildSitemap(articles) {
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...STATIC_PAGES.map((p) => ({
      loc: `${SITE}${p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    })),
    ...articles.map((a) => ({
      loc: a.url,
      lastmod: a.date,
      changefreq: "yearly",
      priority: "0.7",
    })),
  ];

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const root = process.cwd();
const { articles, problems } = await loadArticles(root);

for (const problem of problems) {
  console.error(`skipped — ${problem}`);
}

await writeFile(join(root, "rss.xml"), buildRss(articles));
await writeFile(join(root, "sitemap.xml"), buildSitemap(articles));

console.log(`rss.xml and sitemap.xml written (${articles.length} article${articles.length === 1 ? "" : "s"})`);
if (problems.length) {
  console.error(`\n${problems.length} article(s) skipped. Fix the meta tags and run again.`);
  process.exit(1);
}
