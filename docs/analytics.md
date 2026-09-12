# Analytics YAAVS (dataLayer)

El sitio empuja eventos a `window.dataLayer` cuando el visitante **acepta cookies de analítica**.

## Eventos

| Evento | Cuándo |
|--------|--------|
| `cta_click` | Clics en CTAs (page-cta, Quiénes somos, home band, etc.) |
| `whatsapp_click` | Enlaces a WhatsApp (header, footer, CTAs) |
| `yaavser_lead_open` | Abrir modal / lead “Únete como socio” |
| `form_submit` | Envío de contacto o solicitud Yaavser |
| `analytics_enabled` | Al aceptar analítica |

Los elementos llevan `data-yaavs-track` y opcional `data-yaavs-track-label`.

## Conectar GA4 / GTM

1. Crea un contenedor GTM o propiedad GA4.
2. Inserta el snippet de GTM/gtag en el `<head>` (solo tras consentimiento, o deja que GTM lea `dataLayer`).
3. En GTM, crea triggers de tipo Custom Event con los nombres de la tabla.

Sin Measurement ID el tracking sigue funcionando en `dataLayer` (útil en consola para pruebas).

Script: [`js/yaavs-analytics.js`](../js/yaavs-analytics.js) (cargado desde `js/layout.js`).
