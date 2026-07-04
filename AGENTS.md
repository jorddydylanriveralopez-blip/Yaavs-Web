# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **dependency-free static website** (YAAVS corporate site): plain HTML/CSS/vanilla JS. There is **no package manager, no build step, no lint config, and no automated tests** — nothing to install. `python3` (used for the dev server) is already available.

### Running the site
- Serve from the repo root over HTTP, e.g. `python3 -m http.server 8080`, then open `http://localhost:8080`. See `README.md` for details.
- **Must be served over HTTP.** Do NOT open the `.html` files via `file://`: `js/layout.js` loads the shared `partials/header.html` and `partials/footer.html` (and other partials) via `fetch()`, which fails on `file://`, leaving the nav and footer missing.

### Testing / verifying changes
- No test/lint/build tooling exists — verification is manual/visual by loading pages in a browser through the local server.
- Forms submit via a `mailto:Hola@yaavs.com.mx` link (no backend); clicking "Enviar" opens a mail client rather than posting to a server.
