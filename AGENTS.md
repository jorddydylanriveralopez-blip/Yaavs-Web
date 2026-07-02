# AGENTS.md

See `README.md` for pages and structure.

## Cursor Cloud specific instructions

Static multipage corporate site (plain HTML/CSS/JS — no build step, no npm dependencies).

### How to run (dev)
Serve over HTTP from the repo root, e.g.:
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080/index.html`.

- You **must** use an HTTP server (not `file://`): the shared header and footer are fetched at runtime from `partials/` by `js/layout.js`. Opening files directly leaves the nav/footer empty.
