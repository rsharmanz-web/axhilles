# Axhillies

Simple, static one-page site for Axhillies — no build step or dependencies required.

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

- **Contact email**: currently set to `hello@axhillies.com` in `index.html` and `script.js` — update both to your real inbox.
- **Who we are**: the section currently has placeholder copy — swap in real founder/team bios.
- **Colors**: all theme colors (background, text, cobalt accents) are defined as CSS variables at the top of `styles.css` under `:root`.
