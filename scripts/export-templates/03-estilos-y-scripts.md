# 03 — Estilos y scripts

## CSS (raíz) — por área

### Global / tema
- `styles.css` — base del sitio  
- `theme-light.css` — tema día  
- `theme-day-night.css` — día/noche  
- `decorations.css` — floats, texturas, adornos  
- `cookies.css` — banner de cookies  
- `site-footer.css` — pie  

### Home
- `home-corporate.css`  
- `home-experience.css`  
- `home-wow.css`  

### Interiores
- `interior-corporate.css`  
- `interior-light.css`  

### Por página
- `quienes-asi.css` — Quiénes somos  
- `avisos-page.css` — Anuncios  
- `tiendas-page.css` / `tiendas-map-page.css`  
- `yaavser-page.css` / `yaavser-lead.css`  
- `testimonios-historias.css`  
- `recargar.css`  

## JS — por área

### Núcleo
- `js/layout.js` — header/footer/partials  
- `js/main.js` — utilidades globales  
- `js/yaavs-theme.js` — tema  
- `js/page-enter.js` / `js/page-intro.js` — entrada  
- `js/cookies.js` / `js/pwa.js`  

### Home
- `js/home-experience.js`, `js/home-wow.js`  
- `js/hero-carousel.js` (+ `.config.js`)  
- `js/deck-media.config.js`, `js/services-carousel.js`  
- `js/home-testimonials-carousel.js`  

### Páginas
- `js/quienes-*.js` — Quiénes somos  
- `js/avisos-page.js`, `js/avisos-banner.js`  
- `js/tiendas-map.js`, `js/tiendas-att-stores.js`  
- `js/yaavser-page.js`, `js/yaavser-lead.js`  
- `js/testimonios-historias.js`  
- `js/bolsa-*.js`  
- `js/taecel-recarga.js` — recargas  
- `js/yaavs-chatbot.js` — bot  

### API (serverless)
- `api/chat.js`  
- `api/taecel/` — recarga / productos  

Al editar CSS/JS en HTML, **sube el `?v=`** para evitar caché CDN.
