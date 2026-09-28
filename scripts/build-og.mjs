// Renders a 1200x630 link-preview card per article, plus a site default, into og/.
//
//   node scripts/build-og.mjs
//
// Needs Chrome on the path. Set CHROME to override the binary.
// Run it after adding or retitling an article.

import { mkdir, mkdtemp, stat, writeFile, rm } from "node:fs/promises";
import { execFile, spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { loadArticles } from "./articles.mjs";

const run = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const SHOT_TIMEOUT_MS = 90_000;

async function sizeOf(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return null;
  }
}

const CHROME_CANDIDATES = [
  process.env.CHROME,
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await run(candidate, ["--version"]);
      return candidate;
    } catch {
      // try the next one
    }
  }
  throw new Error(
    `No Chrome found. Tried: ${CHROME_CANDIDATES.join(", ")}. Install Chrome or set CHROME=/path/to/chrome.`
  );
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Kept deliberately close to styles.css: alabaster ground, cobalt accent, Space Grotesk.
// Fonts are loaded from Google if the network allows, and fall back to a local sans otherwise.
function card({ kicker, title, footer }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    font-family: 'Space Grotesk', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
    color: #33241C;
    background:
      radial-gradient(circle at 26% 22%, rgba(0,32,194,0.20) 0%, rgba(0,32,194,0.05) 30%, transparent 55%),
      radial-gradient(circle at 80% 14%, rgba(214,200,176,0.95) 0%, transparent 46%),
      radial-gradient(circle at 55% 86%, rgba(230,223,211,0.7) 0%, transparent 42%),
      linear-gradient(160deg, #efe6d8 0%, #fbf9f6 42%, #f3ebe1 100%);
    position: relative;
  }
  .frame {
    position: absolute;
    inset: 40px;
    border: 1px solid #E6DFD3;
    border-radius: 16px;
    padding: 58px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(255,255,255,0.22);
  }
  .logo {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .logo span { color: #0020C2; }
  .kicker {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #0020C2;
    margin-bottom: 22px;
  }
  .rule { width: 56px; height: 4px; background: #0020C2; margin-bottom: 30px; }
  h1 {
    font-size: ${title.length > 74 ? 54 : title.length > 46 ? 64 : 76}px;
    font-weight: 700;
    line-height: 1.06;
    letter-spacing: -0.035em;
    max-width: 21ch;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #33241C;
    opacity: 0.55;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="logo"><span>&gt;&gt;</span> axhilles</div>
    <div>
      ${kicker ? `<div class="kicker">${escapeHtml(kicker)}</div>` : ""}
      <div class="rule"></div>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="footer">
      <span>${escapeHtml(footer)}</span>
      <span>axhilles.com</span>
    </div>
  </div>
</body>
</html>`;
}

// Some installs wrap the chrome binary and inject --remote-debugging-port, which stops it exiting
// after --screenshot. So watch for the PNG to land and settle, then stop the process ourselves.
async function shoot(chrome, html, outPath, workDir, index) {
  const htmlPath = join(workDir, `card-${index}.html`);
  await writeFile(htmlPath, html);
  await rm(outPath, { force: true });

  const child = spawn(
    chrome,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      "--virtual-time-budget=5000",
      `--user-data-dir=${join(workDir, `profile-${index}`)}`,
      `--screenshot=${outPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "ignore" }
  );

  let exited = false;
  child.on("exit", () => {
    exited = true;
  });

  const deadline = Date.now() + SHOT_TIMEOUT_MS;
  let lastSize = null;

  while (Date.now() < deadline) {
    await sleep(250);
    const size = await sizeOf(outPath);
    if (size !== null && size > 0 && size === lastSize) break;
    lastSize = size;
    if (exited && size !== null) break;
    if (exited && Date.now() > deadline - SHOT_TIMEOUT_MS + 2000) break;
  }

  if (!exited) child.kill("SIGKILL");

  const finalSize = await sizeOf(outPath);
  if (!finalSize) throw new Error(`Chrome produced no screenshot for ${outPath}`);
}

const root = process.cwd();
const chrome = await findChrome();
const workDir = await mkdtemp(join(tmpdir(), "axhilles-og-"));
await mkdir(join(root, "og"), { recursive: true });

try {
  const { articles, problems } = await loadArticles(root);
  for (const problem of problems) console.error(`skipped — ${problem}`);

  await shoot(
    chrome,
    card({
      kicker: "Strategy · Design · Technology · Capability",
      title: "Make your business super, human",
      footer: "Auckland · Melbourne · Austin",
    }),
    join(root, "og", "default.png"),
    workDir,
    0
  );
  console.log("og/default.png");

  let index = 1;
  for (const article of articles) {
    await shoot(
      chrome,
      card({
        kicker: article.series ? `Article ${article.series} of 5` : "Article",
        title: article.title,
        footer: "Rahul Sharma",
      }),
      join(root, "og", `${article.slug}.png`),
      workDir,
      index
    );
    console.log(`og/${article.slug}.png`);
    index += 1;
  }
} finally {
  // A killed chrome can still be flushing its profile, so a failed cleanup of a temp dir is not
  // worth failing the build over.
  await sleep(250);
  await rm(workDir, { recursive: true, force: true }).catch(() => {});
}
