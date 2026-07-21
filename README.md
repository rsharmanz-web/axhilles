# Axhilles

Simple, static one-page site for Axhilles — no build step or dependencies required.

## Structure

- `index.html` — page content and structure
- `styles.css` — terminal-inspired theme (black background, white text, cobalt accents)
- `script.js` — typewriter hero effect, mobile nav, scroll reveal, contact form (opens a pre-filled email)

## Running locally

Just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying

This is a static site, so it can be deployed as-is to Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any static host — just upload the three files.

## To customize

- **Contact email**: currently set to `hello@axhilles.com` in `index.html` and `script.js` — update both if you want to change the inbox. Make sure `hello@axhilles.com` has email routing/forwarding set up (e.g. via Cloudflare Email Routing) so it actually reaches an inbox you check.
- **Who we are**: the section currently has placeholder copy — swap in real founder/team bios.
- **Colors**: all theme colors (background, text, cobalt accents) are defined as CSS variables at the top of `styles.css` under `:root`.
