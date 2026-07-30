#!/usr/bin/env python3
"""Inject SEO meta tags into all public HTML pages from data/seo-site.json."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = json.loads((ROOT / "data" / "seo-site.json").read_text(encoding="utf-8"))
ORIGIN = CFG["siteOrigin"].rstrip("/")
OG_IMAGE = ORIGIN + CFG["ogImage"]
DEFAULT_KW = CFG["defaultKeywords"]
ORG = CFG["organization"]
PAGES = CFG["pages"]


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def build_block(page: str, meta: dict) -> str:
    title = meta["title"]
    desc = meta["description"]
    robots = meta.get("robots", "index, follow, max-image-preview:large")
    kws = list(DEFAULT_KW) + list(meta.get("keywords") or [])
    # unique preserve order
    seen = set()
    keywords = []
    for k in kws:
        if k not in seen:
            seen.add(k)
            keywords.append(k)
    url = f"{ORIGIN}/{page if page != 'index.html' else ''}".rstrip("/") or ORIGIN + "/"
    if page == "index.html":
        url = ORIGIN + "/"

    ld_org = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": ORG["name"],
        "legalName": ORG.get("legalName", ORG["name"]),
        "url": ORIGIN + "/",
        "logo": ORIGIN + "/assets/pwa/icon-512.png",
        "email": ORG["email"],
        "telephone": ORG["telephone"],
        "sameAs": ORG["sameAs"],
        "areaServed": "MX",
        "description": CFG["pages"]["index.html"]["description"],
    }
    ld_website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": CFG["siteName"],
        "url": ORIGIN + "/",
        "inLanguage": "es-MX",
        "publisher": {"@type": "Organization", "name": ORG["name"]},
    }
    ld_webpage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": desc,
        "url": url,
        "isPartOf": {"@type": "WebSite", "url": ORIGIN + "/"},
        "inLanguage": "es-MX",
    }

    scripts = []
    if page == "index.html":
        scripts.append(
            f'  <script type="application/ld+json">{json.dumps(ld_org, ensure_ascii=False)}</script>\n'
            f'  <script type="application/ld+json">{json.dumps(ld_website, ensure_ascii=False)}</script>\n'
        )
    scripts.append(
        f'  <script type="application/ld+json">{json.dumps(ld_webpage, ensure_ascii=False)}</script>\n'
    )

    block = (
        f'  <!-- yaavs-seo -->\n'
        f'  <meta name="robots" content="{esc(robots)}">\n'
        f'  <meta name="googlebot" content="{esc(robots)}">\n'
        f'  <meta name="author" content="{esc(ORG["name"])}">\n'
        f'  <meta name="keywords" content="{esc(", ".join(keywords))}">\n'
        f'  <link rel="canonical" href="{esc(url)}">\n'
        f'  <meta property="og:type" content="website">\n'
        f'  <meta property="og:locale" content="{esc(CFG["locale"])}">\n'
        f'  <meta property="og:site_name" content="{esc(CFG["siteName"])}">\n'
        f'  <meta property="og:title" content="{esc(title)}">\n'
        f'  <meta property="og:description" content="{esc(desc)}">\n'
        f'  <meta property="og:url" content="{esc(url)}">\n'
        f'  <meta property="og:image" content="{esc(OG_IMAGE)}">\n'
        f'  <meta property="og:image:alt" content="{esc(CFG["siteName"] + " — telecomunicaciones")}">\n'
        f'  <meta name="twitter:card" content="summary_large_image">\n'
        f'  <meta name="twitter:title" content="{esc(title)}">\n'
        f'  <meta name="twitter:description" content="{esc(desc)}">\n'
        f'  <meta name="twitter:image" content="{esc(OG_IMAGE)}">\n'
        + "".join(scripts)
        + f'  <!-- /yaavs-seo -->\n'
    )
    return block


def patch_html(path: Path, page: str, meta: dict) -> bool:
    text = path.read_text(encoding="utf-8")
    # Remove previous injected block
    text2 = re.sub(
        r"\n?  <!-- yaavs-seo -->.*?  <!-- /yaavs-seo -->\n?",
        "\n",
        text,
        flags=re.S,
    )

    # Sync title + description if present
    title = meta["title"]
    desc = meta["description"]
    text2 = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{esc(title)}</title>",
        text2,
        count=1,
    )
    if re.search(r'<meta\s+name="description"', text2, re.I):
        text2 = re.sub(
            r'<meta\s+name="description"\s+content="[^"]*"\s*/?>',
            f'<meta name="description" content="{esc(desc)}">',
            text2,
            count=1,
            flags=re.I,
        )
    else:
        text2 = text2.replace(
            "<title>",
            f'<meta name="description" content="{esc(desc)}">\n  <title>',
            1,
        )

    block = build_block(page, meta)
    # Insert after <title>...</title>
    m = re.search(r"<title>[^<]*</title>\n?", text2)
    if not m:
        return False
    insert_at = m.end()
    text2 = text2[:insert_at] + block + text2[insert_at:]
    if text2 != text:
        path.write_text(text2, encoding="utf-8")
        return True
    return False


def write_robots() -> None:
    (ROOT / "robots.txt").write_text(
        f"""User-agent: *
Allow: /

Disallow: /offline.html
Disallow: /api/
Disallow: /partials/
Disallow: /scripts/

Sitemap: {ORIGIN}/sitemap.xml
""",
        encoding="utf-8",
    )


def write_sitemap() -> None:
    urls = []
    for page, meta in PAGES.items():
        if "noindex" in meta.get("robots", ""):
            continue
        loc = ORIGIN + "/" if page == "index.html" else f"{ORIGIN}/{page}"
        # priority heuristic
        prio = "1.0" if page == "index.html" else "0.8"
        if page in ("aviso-privacidad.html", "terminos-condiciones.html"):
            prio = "0.3"
        urls.append(
            f"""  <url>
    <loc>{loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>{prio}</priority>
  </url>"""
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


def main() -> None:
    changed = []
    for page, meta in PAGES.items():
        path = ROOT / page
        if not path.exists():
            print("skip missing", page)
            continue
        if patch_html(path, page, meta):
            changed.append(page)
            print("updated", page)
        else:
            print("unchanged", page)
    write_robots()
    write_sitemap()
    print("wrote robots.txt + sitemap.xml")
    print("files changed:", len(changed))


if __name__ == "__main__":
    main()
