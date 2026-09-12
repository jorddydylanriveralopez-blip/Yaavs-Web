#!/usr/bin/env bash
# Genera pospago-site/ — sitio Pospago independiente de Yaavs (yaavs.com.mx / royal-blue-gear).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/pospago-site"
POSPAGO_URL="$(python3 -c "import json; print(json.load(open('$ROOT/data/site-urls.json'))['pospago'].rstrip('/'))")"

echo "→ Building YAAVS Pospago site → $OUT"
echo "→ Public URL: $POSPAGO_URL"

rm -rf "$OUT"
mkdir -p "$OUT"/{js,partials,assets}

# HTML principal
sed "s|__POSPAGO_URL__|$POSPAGO_URL|g" "$ROOT/pages/postpago.page.html" > "$OUT/index.html"

# CSS
cp "$ROOT/pospago-base.css" "$OUT/pospago-base.css"
cp "$ROOT/pospago.css" "$OUT/pospago.css"

# JS
for f in layout-pospago.js pospago-coverflow.js pospago-plans.js pospago-stores.js tiendas-att-stores.js; do
  cp "$ROOT/js/$f" "$OUT/js/$f"
done

# Partials
cp "$ROOT/partials/header-pospago.html" "$OUT/partials/header-pospago.html"
cp "$ROOT/partials/footer-pospago.html" "$OUT/partials/footer-pospago.html"

# Assets
for dir in pospago bolsa servicios quienes tiendas floats operadores rotulaciones social; do
  if [[ -d "$ROOT/assets/$dir" ]]; then
    mkdir -p "$OUT/assets/$dir"
    cp -R "$ROOT/assets/$dir/." "$OUT/assets/$dir/"
  fi
done

# robots + sitemap
cat > "$OUT/robots.txt" <<EOF
User-agent: *
Allow: /

Sitemap: $POSPAGO_URL/sitemap.xml
EOF

cat > "$OUT/sitemap.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>$POSPAGO_URL/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

cat > "$OUT/.htaccess" <<'EOF'
DirectoryIndex index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]
</IfModule>
EOF

cat > "$OUT/README.md" <<EOF
# YAAVS Pospago — sitio independiente

Este folder es **solo** el sitio de Pospago. No se despliega en yaavs.com.mx ni en \`royal-blue-gear-650111.hostingersite.com\`.

## Hostinger (sitio nuevo, gratis)

1. En hPanel → **Websites** → **Add Website** → crear sitio **nuevo** (subdominio \`.hostingersite.com\` gratis).
2. Conectar el **mismo repositorio** de GitHub que Yaavs.
3. En **Deploy settings**, carpeta de publicación: \`pospago-site\` (no la raíz).
4. Copia la URL que te asigne Hostinger (ej. \`https://algo-nuevo.hostingersite.com\`).
5. Actualiza \`data/site-urls.json\` → clave \`pospago\` con esa URL.
6. Ejecuta \`./scripts/build-pospago-site.sh\` y haz push a \`main\`.

URL configurada ahora: **$POSPAGO_URL**
EOF

echo "✓ pospago-site/ listo ($(find "$OUT" -type f | wc -l | tr -d ' ') archivos)"
