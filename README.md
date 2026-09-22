# Axhilles

Static site for Axhilles, plus a chat at `/chat` that talks about the firm.

## Structure

- `index.html` — marketing page
- `styles.css` — alabaster / espresso / cobalt
- `script.js` — booking links, mobile nav
- `chat/` — “Ask about Axhilles” UI (`axhilles.com/chat`)
- `api/chat.js` — Vercel function; streams Claude Haiku 4.5
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

Set `ANTHROPIC_API_KEY` in `.env.local` (gitignored) or `vercel env add ANTHROPIC_API_KEY`.

## Deploying

Push to `main`. Production is the Axhilles Vercel project (axhilles.com).

In the Vercel project, add environment variable **`ANTHROPIC_API_KEY`** (Production + Preview). Without it, `/api/chat` returns “Chat is not configured yet.”

## Chat

Firm voice, not Rahul. Knowledge is the live site: Ways in, About, Discovery booking. Ten messages per IP per ten minutes. No transcript store.
