# Axhilles

Static site for Axhilles, plus a mascot chat at `/chat`.

## Structure

- `index.html` — marketing page
- `readings/` — curated articles
- `privacy/` — privacy policy (live, not yet lawyer-reviewed; see the comment at the top of the file)
- `styles.css` — alabaster / espresso / cobalt
- `script.js` — booking links, mobile nav
- `chat/` — mascot chat UI (`axhilles.com/chat`)
- `api/chat.js` — Vercel function; streams Claude Haiku 4.5 with `MASCOT_SYSTEM_PROMPT`
- `api/chat-log.js` — emails a Chax transcript after 5 min inactive or at turn limit
- `api/lead.js` — lead form; summarises the transcript and emails Rahul
- `lib/` — prompts (as-is), placeholders, `saveLead`, `logChatQuestion`
- `scripts/verdict-test.mjs` — runs `VERDICT_TEST_CASES` against the mascot
- `spine/` — audit and finance workshop boards

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

## Privacy policy

`privacy/index.html` is live and linked from every footer, from the chat sidebar, and from the consent form
inside the chat. It has **not been checked by a lawyer** — published ahead of review deliberately, since the
chat asks for consent and links here, so an unreviewed policy beats none.

What it says was written against the code rather than from a template, which is the part a lawyer can't
check. In particular it discloses that a chat transcript is emailed to a human even when the visitor stays
anonymous, and that the transcript is sent back to the model to produce call-prep notes. It names all four
processors — Anthropic, Resend, Vercel, Calendly — and describes the one real browser storage key rather
than generic cookie language.

**It goes stale the moment the data flows change.** If a processor is added, or something new is stored in
the browser, or the chat starts doing something else with a transcript, this file is wrong first and most
expensively. Treat updating it as part of the same commit.

The chat's consent is two separate ticks: a required one covering a reply to that conversation, and an
optional one for marketing. The lead email prints `Marketing opt-in: yes/no`, so any future nurture emails
have real permission to filter on rather than leaning on the required tick.

## Placeholders

Edit `lib/placeholders.js` (and the matching constants at the top of `chat/chat.js`). Do not edit `lib/mascot-prompt.js`.

- `{{MASCOT_NAME}}`
- `{{BOOKING_LINK}}`
- `{{READING_LIST_LINK}}` — filled with `https://axhilles.com/readings/`
- `{{PRIVACY_URL}}` — filled with `https://axhilles.com/privacy/`

All three are live URLs so the mascot handoff can point at them. `PRIVACY_URL` used to be declared but never
substituted, because there was no page to point at; `fillMascotPrompt` now replaces it like the others.

## Verdict tests

Uses the API key and will spend tokens. From the repo root:

```bash
node --env-file=.env.local scripts/verdict-test.mjs
```

## Deploying

Push to `main`. Production is the Axhilles Vercel project (axhilles.com).

Add the environment variables on the Vercel project (Production + Preview). Chat is 10 messages per IP per ten minutes; lead form is 5 per IP per ten minutes. Conversations cap at about 30 messages, then the UI offers a handoff.
