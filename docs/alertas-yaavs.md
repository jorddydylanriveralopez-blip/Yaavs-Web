# Alertas YAAVS — cómo publicar

Cuando subas un blog, una promo o una vacante, haz **dos cosas**: el feed in-app y el push al teléfono.

## 1. Feed in-app (campanita)

Edita [`data/yaavs-alerts.json`](../data/yaavs-alerts.json) y agrega un item **arriba** de la lista (o con `createdAt` reciente):

```json
{
  "id": "promo-agosto-2026",
  "type": "promo",
  "title": "Conoce nuestras nuevas ofertas",
  "body": "Texto corto de la promo…",
  "url": "index.html#promo",
  "createdAt": "2026-08-01"
}
```

Tipos:

| `type` | Título típico | `url` sugerida |
|--------|---------------|----------------|
| `promo` | Conoce nuestras nuevas ofertas | `index.html#promo` |
| `blog` | Nueva nota en Noticias Yaavs | `avisos.html` |
| `vacante` | Nueva vacante: {puesto} | `bolsa-trabajo.html#catalogo-vacantes` |

- `id` debe ser **único** (si lo reusas, quien ya lo vio no lo vuelve a marcar como nuevo).
- Sube `version` o el `?v=` del fetch en `js/yaavs-alerts.js` si Hostinger cachea el JSON.
- Commit + push a `main`.

## 2. Push al teléfono (OneSignal)

1. Crea cuenta en [OneSignal](https://onesignal.com) → Web.
2. Site URL = tu dominio Hostinger (ej. `https://….hostingersite.com`).
3. Service Worker path = `OneSignalSDKWorker.js` (ya está en la raíz; no subas el zip a mano).
4. Copia el **App ID** en [`js/yaavs-onesignal.config.js`](../js/yaavs-onesignal.config.js) → `appId`.
5. En el Dashboard → **Messages → New Push**:
   - Mismo título y cuerpo que el item del JSON.
   - Launch URL = la misma `url` del item.
   - Opcional: segmenta por tags `interest_promo` / `interest_blog` / `interest_vacante` (`1` = quiere recibir).

Plantillas útiles en OneSignal: **Promo**, **Blog**, **Vacante**.

## 3. Vacantes

Además del alert `type: "vacante"`, actualiza `OPEN_JOBS` / catálogo en [`js/bolsa-vacantes.js`](../js/bolsa-vacantes.js). En bolsa, si hay vacantes no leídas, aparece el aviso *“Hay vacantes nuevas — ve tus notificaciones”*.

## 4. Permisos

- El usuario activa avisos desde el prompt o abriendo la campanita.
- **Android Chrome**: push con permiso.
- **iOS**: requiere agregar YAAVS a la pantalla de inicio (PWA) + permiso.

## Checklist rápido

- [ ] Contenido publicado (HTML / imagen promo / vacante)
- [ ] Item nuevo en `data/yaavs-alerts.json`
- [ ] Push enviado en OneSignal (mismo copy + URL)
- [ ] Push a `origin/main`
