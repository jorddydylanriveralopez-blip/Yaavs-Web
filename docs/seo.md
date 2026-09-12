# SEO YAAVS

Metadatos para Google, redes y compartir enlaces.

## Archivos

| Archivo | Rol |
|---------|-----|
| [`data/seo-site.json`](../data/seo-site.json) | Origen del sitio, keywords, títulos y descripciones por página |
| [`scripts/inject-seo.py`](../scripts/inject-seo.py) | Inyecta meta OG/Twitter/canonical/JSON-LD en los HTML |
| [`robots.txt`](../robots.txt) | Permite rastreo y apunta al sitemap |
| [`sitemap.xml`](../sitemap.xml) | Lista de URLs para Search Console |

## Cuando cambies el dominio

1. Edita `siteOrigin` en `data/seo-site.json` (ej. `https://www.yaavs.com.mx`).
2. Corre: `python3 scripts/inject-seo.py`
3. Commit + push a `main`.

## Google Search Console

1. Entra a [Google Search Console](https://search.google.com/search-console).
2. Añade la propiedad del dominio (o URL del prefijo Hostinger).
3. Envía el sitemap: `https://TU-DOMINIO/sitemap.xml`.

## Al editar una página

Actualiza título/descripción/keywords en `data/seo-site.json` y vuelve a correr el script (o edita el HTML a mano dentro del bloque `<!-- yaavs-seo -->`).
