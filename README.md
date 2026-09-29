# Axhilles

Static site for Axhilles, plus a mascot chat at `/chat`.

## Structure

- `index.html` — marketing page
- `articles/` — original writing: `index.html` series index, one file per article, `_template.html` to copy
- `readings/` — curated reading list (other people's work)
- `privacy/` — privacy policy; **unreviewed draft**, see below
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

When a Chax visitor is inactive for 5 minutes after asking at least one question, hits the turn limit, or
closes the tab, you get one email with the transcript (`Chax session (…)`). If email fails, it is logged
server-side as `CHAT_SESSION_KEEP` and still appears in Vercel logs as `CHAT_SESSION`.

## Privacy policy

`privacy/index.html` is **live and indexed**, operated by Axhilles Ltd of New Lynn, Auckland. It has
**not been checked by a lawyer** — published ahead of review deliberately, since the chat asks for consent
and links here, so an unreviewed policy beats none. Two follow-ups are recorded in the file header: get it
reviewed and bump the "Last updated" date with whatever comes back, and add a street address or PO Box if
a written request ever needs to reach us by a route other than email.

What it says was written against the code rather than from a template, which is the part a lawyer can't
check for you. In particular it discloses that the chat transcript is emailed to a human even when the
visitor stays anonymous, that the chat requires a name and email to continue and what the alternative is,
and that the transcript is sent back to the model to generate an assessment of the visitor. It names all
four processors — Anthropic, Resend, Vercel, Calendly — and describes the real browser storage keys and
retention rather than generic cookie language.

**It goes stale the moment the data flows change.** If a processor is added, or the chat starts doing
something else with a transcript, this file is the thing that is wrong first and most expensively.

The policy is linked from the footer of every page that has one, from the chat sidebar, from the
persistent notice under the chat composer, and from the consent block in the lead form.

## The chat gate

Chax answers one real question, then asks for a name and email before it will answer another. The
composer is disabled until the form is submitted — `gateOpen` blocks `sendPrompt` as well as the
textarea, so the lock holds in logic and not only in CSS. `FREE_EXCHANGES` in `chat/chat.js` sets how
many questions come first.

Easter eggs and the Odyssey answer do not count towards it. The locked replies carry an `offerBook` flag
that marks the ones engaging with the business question, and only those increment the counter, so nobody
gets walled straight after a joke.

The form asks for two separate ticks. The required one consents to a reply about this conversation; the
optional one consents to marketing and is reported in the lead email as `Marketing opt-in`. They are kept
apart so the nurture cadence in `sales/4-follow-up.md` rests on consent somebody actually gave. Below them
sits a notice carrying the 18+ statement, the fact that the transcript is emailed either way, and a link
to the policy.

Leads carry a `reason` so the subject line separates the two kinds:

| `reason` | Subject | Means |
| --- | --- | --- |
| `gate` | `New Axhilles lead (chatting): …` | We stopped them to ask. Interested, has not asked for anything |
| `booking` | `New Axhilles lead (wants a call): …` | They asked for a call. Treat as a hand-raise |

Two consequences worth knowing:

- **A gate lead is not the end of the conversation**, so session logging stays armed and the rest of the
  transcript arrives later as `Chax session — <name> (…)`. It is suppressed if they never said anything
  more, so the same exchange does not arrive twice.
- **Once details are captured the form has nothing left to ask**, so booking links and the booking chip
  go straight to `BOOKING_LINK` instead of reopening it.

Walking away from the gate still tells you something: `pagehide` flushes the session log, so the question
and the article it came from arrive even though the visitor stayed anonymous.

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
- `{{PRIVACY_URL}}` — filled with `https://axhilles.com/privacy/`

All three are live URLs so the mascot handoff can point at them, and `fillMascotPrompt` substitutes all three.

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
