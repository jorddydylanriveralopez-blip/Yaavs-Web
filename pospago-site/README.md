# YAAVS Pospago — sitio independiente

Este folder es **solo** el sitio de Pospago. No se despliega en yaavs.com.mx ni en `royal-blue-gear-650111.hostingersite.com`.

## Hostinger (sitio nuevo, gratis)

1. En hPanel → **Websites** → **Add Website** → crear sitio **nuevo** (subdominio `.hostingersite.com` gratis).
2. Conectar el **mismo repositorio** de GitHub que Yaavs.
3. En **Deploy settings**, carpeta de publicación: `pospago-site` (no la raíz).
4. Copia la URL que te asigne Hostinger (ej. `https://algo-nuevo.hostingersite.com`).
5. Actualiza `data/site-urls.json` → clave `pospago` con esa URL.
6. Ejecuta `./scripts/build-pospago-site.sh` y haz push a `main`.

URL configurada ahora: **https://pospago-yaavs-site.hostingersite.com**
