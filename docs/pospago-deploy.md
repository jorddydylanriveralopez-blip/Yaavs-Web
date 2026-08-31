# Despliegue YAAVS Pospago (sitio separado)

Pospago **no** va en yaavs.com.mx ni en `royal-blue-gear-650111.hostingersite.com`. Es un sitio distinto dentro del mismo repo, en la carpeta `pospago-site/`.

## 1. Crear sitio nuevo en Hostinger

1. hPanel → **Websites** → **Add Website**
2. Elige subdominio gratis `*.hostingersite.com` (o dominio propio si lo tienes)
3. **No** reutilices el sitio “royal-blue-gear” de Yaavs

## 2. Conectar GitHub

1. En el sitio **nuevo** → **Git** → conectar el repo `Yaavs-Web`
2. Rama: `main`
3. **Publish directory / carpeta de despliegue:** `pospago-site` (importante: no la raíz)

## 3. URL pública

Cuando Hostinger te dé la URL (ej. `https://midominio-nuevo.hostingersite.com`):

1. Edita `data/site-urls.json` → `"pospago": "https://TU-URL-AQUI"`
2. Ejecuta `./scripts/build-pospago-site.sh`
3. Commit y push a `main`

El script regenera `pospago-site/` con SEO, sitemap y redirects apuntando a esa URL.

## 4. Yaavs principal

- `postpago.html` y `pospago.html` en la raíz solo redirigen al sitio Pospago
- El home de Yaavs enlaza a Pospago en dominio externo (nueva pestaña)
- Pospago ya no está en el sitemap de yaavs.com.mx

## Editar contenido Pospago

Fuente: `pages/postpago.page.html`  
Después de cambios: `./scripts/build-pospago-site.sh` y push.
