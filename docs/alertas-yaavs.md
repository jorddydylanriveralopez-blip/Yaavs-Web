# Alertas YAAVS — cómo publicar

Los avisos llegan al **teléfono** (OneSignal). Ya no hay campanita in-app; el JSON sirve como bitácora / copy de referencia al crear el push.

## 1. Registro de aviso (opcional)

Edita [`data/yaavs-alerts.json`](../data/yaavs-alerts.json) y agrega un item arriba:

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

## 2. Push al teléfono (OneSignal)

1. Dashboard OneSignal → **Messages → New Push**
2. Mismo título y cuerpo que el item del JSON
3. Launch URL = la misma `url`
4. Opcional: segmenta por tags `interest_promo` / `interest_blog` / `interest_vacante` (`1` = quiere recibir)

App ID en [`js/yaavs-onesignal.config.js`](../js/yaavs-onesignal.config.js). Service Worker: `OneSignalSDKWorker.js` en la raíz.

Los tags se actualizan cuando el visitante usa el prompt “Activar avisos” (preferencias locales).

## 3. Vacantes

Además del alert `type: "vacante"`, actualiza el catálogo en [`js/bolsa-vacantes.js`](../js/bolsa-vacantes.js).

## 4. Permisos

- Prompt suave en el sitio, o botón **Activar avisos** en Cuenta.
- **Android Chrome**: push con permiso.
- **iOS**: PWA en pantalla de inicio + permiso.

## Checklist

- [ ] Contenido publicado
- [ ] Item en `data/yaavs-alerts.json` (opcional)
- [ ] Push en OneSignal (copy + URL + tags)
- [ ] Push a `origin/main`
