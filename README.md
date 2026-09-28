# Axhilles

Static site for Axhilles, plus a mascot chat at `/chat`.

## Structure

- `index.html` — marketing page
- `articles/` — original writing: `index.html` series index, one file per article, `_template.html` to copy
- `readings/` — curated reading list (other people's work)
- `styles.css` — alabaster / espresso / cobalt
- `script.js` — booking links, mobile nav
- `attribution.js` — remembers how a visitor arrived; loaded on every page
- `chat/` — mascot chat UI (`axhilles.com/chat`)
- `api/chat.js` — Vercel function; streams Claude Haiku 4.5 with `MASCOT_SYSTEM_PROMPT`
- `api/chat-log.js` — emails a Chax transcript after 5 min inactive or at turn limit
- `api/lead.js` — lead form; summarises the transcript and emails Rahul
- `lib/` — prompts (as-is), placeholders, `saveLead`, `logChatQuestion`, `cleanAttribution`
- `og/` — generated 1200×630 link-preview cards; do not edit by hand
- `rss.xml`, `sitemap.xml` — generated; `robots.txt` — hand-edited
- `scripts/verdict-test.mjs` — runs `VERDICT_TEST_CASES` against the mascot
- `scripts/build-og.mjs`, `scripts/build-feeds.mjs` — regenerate `og/`, `rss.xml` and `sitemap.xml`
- `spine/` — audit and finance workshop boards
- `sales/` — outbound playbook: ICP and list building, cold-call scripts, lead scoring, follow-up cadences, pipeline tracker

## Running locally

The homepage is static:

```bash
python3 -m http.server 8000
```

Chat needs the API, so use Vercel:

```bash
npx vercel dev
```

Set secrets in `.env.local` (gitignored) or `vercel env add …`.

## Environment

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Chat + lead summary + verdict tests |
| `EMAIL_API_KEY` | Resend API key |
| `LEAD_EMAIL_TO` | `rahul@axhilles.com` |
| `LEAD_EMAIL_FROM` | `hello@axhilles.com` (must be a verified Resend domain) |
| `CHAT_LOG_EMAIL_TO` | Optional. Defaults to `LEAD_EMAIL_TO`. Inbox for Chax questions |

Without `ANTHROPIC_API_KEY`, `/api/chat` returns “Chat is not configured yet.”

Leads are emailed with [Resend](https://resend.com). If the email fails, the lead is logged server-side (`LEAD_KEEP`) and the visitor still sees the confirmation.

When a Chax visitor is inactive for 5 minutes after asking at least one question, or hits the turn limit, you get one email with the transcript (`Chax session (…)`). If they already submitted the lead form, that lead email is enough and no session log is sent. If email fails, it is logged server-side as `CHAT_SESSION_KEEP` and still appears in Vercel logs as `CHAT_SESSION`.

## Lead attribution

Both the lead email and the Chax session email open with a `SOURCE` block naming the article that
earned the conversation:

```
SOURCE
Came from: LinkedIn
Landed on: /articles/a-premium-on-judgement.html
Campaign: five-part-series
Content: post-3
```

`attribution.js` records the referrer, the landing path and any `utm_*` parameters on the first page a
visitor lands on, keeps it in `localStorage` for 90 days under `axhilles:attribution`, and exposes it as
`window.axhillesAttribution.get()`. Internal clicks are not treated as new arrivals, and a later direct
visit does not overwrite the campaign that first brought someone in, so the `first` touch survives while
`last` follows the most recent external referral.

`chat/chat.js` posts that record with the lead and with the session log. The server discards anything
malformed, collapses newlines so a crafted value cannot forge its own email section, and truncates each
field — see `lib/attribution.js`. A lead with no attribution still sends, and prints
`Came from: — (not captured)`.

Vercel Web Analytics reports campaign tags in aggregate only, which is why this exists: it is what ties
an individual lead back to a specific article. Tagging conventions are in
[`sales/content-engine.md`](sales/content-engine.md).

## Placeholders

Edit `lib/placeholders.js` (and the matching constants at the top of `chat/chat.js`). Do not edit `lib/mascot-prompt.js`.

- `{{MASCOT_NAME}}`
- `{{BOOKING_LINK}}`
- `{{READING_LIST_LINK}}` — filled with `https://axhilles.com/readings/`
- `{{PRIVACY_URL}}` — also in `chat/index.html`

`BOOKING_LINK` and `READING_LIST_LINK` are live URLs so the mascot handoff can point at them. `PRIVACY_URL` is still a token.

## Publishing an article

```bash
cp articles/_template.html articles/your-slug.html
```

Fill in the six `{{TOKEN}}`s at the top, remove the `robots noindex` line, write the body, add the
article to `articles/index.html`, and set the prev/next links at the foot of the new article and of
the one before it. Then:

```bash
node scripts/build-og.mjs && node scripts/build-feeds.mjs
```

The meta tags in each article are the single source of truth: `og:title`, `og:description`,
`article:published_time` (YYYY-MM-DD) and `axhilles:series` drive the feed, the sitemap and the
link-preview card. An article missing any of the first three is skipped with a warning, and anything
marked `noindex` is ignored. `build-og.mjs` needs Chrome on the path — set `CHROME` to override the
binary — and it prunes cards for articles that no longer exist.

Commit the regenerated `og/*.png`, `rss.xml` and `sitemap.xml` along with the article.

Note that `/articles/` is our own writing and `/readings/` is the curated list of other people's
work. `READING_LIST_LINK` in `lib/placeholders.js` stays pointed at `/readings/`, because the mascot
uses it to recommend third-party pieces.

## Verdict tests

Uses the API key and will spend tokens. From the repo root:

```bash
node --env-file=.env.local scripts/verdict-test.mjs
```

## Deploying

Push to `main`. Production is the Axhilles Vercel project (axhilles.com).

Add the environment variables on the Vercel project (Production + Preview). Chat is 10 messages per IP per ten minutes; lead form is 5 per IP per ten minutes. Conversations cap at about 30 messages, then the UI offers a handoff.
