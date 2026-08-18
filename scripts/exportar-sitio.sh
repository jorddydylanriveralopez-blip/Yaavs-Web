#!/usr/bin/env bash
# Genera entrega/yaavs-web/ — copia limpia y documentada del sitio para exportar.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="${EXPORT_STAMP:-$(date +%Y%m%d)}"
OUT="${ROOT}/entrega/yaavs-web"
SITE="${OUT}/sitio"
ZIP="${ROOT}/entrega/yaavs-web-${STAMP}.zip"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/yaavs-export.XXXXXX")"
trap 'rm -rf "${TMP}"' EXIT

echo "→ Limpiando ${OUT}"
rm -rf "${OUT}"
mkdir -p "${SITE}" "${OUT}/docs"

echo "→ Copiando sitio a temporales (sin secretos ni historial)"
# Copia a /tmp para no incluir entrega/ dentro de sí misma
rsync -a \
  --exclude='.git' \
  --exclude='.cursor/' \
  --exclude='.vercel/' \
  --exclude='.netlify/' \
  --exclude='.vscode/' \
  --exclude='node_modules/' \
  --exclude='entrega/' \
  --exclude='version-anterior/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='*.zip' \
  --exclude='.DS_Store' \
  "${ROOT}/" "${TMP}/sitio/"

rm -f "${TMP}/sitio/.env.local" "${TMP}/sitio/taecel.env" 2>/dev/null || true

rsync -a "${TMP}/sitio/" "${SITE}/"

echo "→ Escribiendo documentación de entrega"
cp "${ROOT}/scripts/export-templates/LEEME.md" "${OUT}/LEEME.md"
cp "${ROOT}/scripts/export-templates/01-orden-del-sitio.md" "${OUT}/docs/01-orden-del-sitio.md"
cp "${ROOT}/scripts/export-templates/02-paginas.md" "${OUT}/docs/02-paginas.md"
cp "${ROOT}/scripts/export-templates/03-estilos-y-scripts.md" "${OUT}/docs/03-estilos-y-scripts.md"
cp "${ROOT}/scripts/export-templates/04-assets.md" "${OUT}/docs/04-assets.md"
cp "${ROOT}/scripts/export-templates/05-despliegue.md" "${OUT}/docs/05-despliegue.md"

{
  echo "# Inventario generado (${STAMP})"
  echo
  echo "## HTML ($(find "${SITE}" -maxdepth 1 -name '*.html' | wc -l | tr -d ' ') archivos)"
  find "${SITE}" -maxdepth 1 -name '*.html' -exec basename {} \; | sort | sed 's/^/- /'
  echo
  echo "## CSS ($(find "${SITE}" -maxdepth 1 -name '*.css' | wc -l | tr -d ' ') archivos)"
  find "${SITE}" -maxdepth 1 -name '*.css' -exec basename {} \; | sort | sed 's/^/- /'
  echo
  echo "## JS ($(find "${SITE}/js" -type f -name '*.js' 2>/dev/null | wc -l | tr -d ' ') archivos)"
  find "${SITE}/js" -type f -name '*.js' 2>/dev/null | sed "s|^${SITE}/||" | sort | sed 's/^/- /'
  echo
  echo "## Assets (carpetas)"
  find "${SITE}/assets" -maxdepth 1 -type d ! -path "${SITE}/assets" -exec basename {} \; 2>/dev/null | sort | sed 's/^/- assets\//'
} > "${OUT}/docs/06-inventario.md"

echo "→ Empaquetando ZIP"
rm -f "${ZIP}"
(
  cd "${ROOT}/entrega"
  zip -rq "$(basename "${ZIP}")" yaavs-web \
    -x "*.DS_Store" \
    -x "*/.env*" \
    -x "*taecel.env"
)

SIZE="$(du -sh "${OUT}" | awk '{print $1}')"
ZIPSIZE="$(du -sh "${ZIP}" | awk '{print $1}')"
echo "✓ Entrega lista:"
echo "  Carpeta: ${OUT} (${SIZE})"
echo "  ZIP:     ${ZIP} (${ZIPSIZE})"
echo "  Sube o comparte la carpeta 'sitio/' o el ZIP completo."
