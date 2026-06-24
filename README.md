# Sitio web YAAVS (multipágina)

Sitio corporativo multipágina, estilo editorial minimalista (negro, tipografía grande, Montserrat, logo blanco).

## Páginas

| Archivo | Contenido |
|---------|-----------|
| `index.html` | Inicio + accesos rápidos |
| `quienes-somos.html` | ¿Quiénes somos? |
| `servicios.html` | Portabilidad, activaciones, TAE, liberaciones |
| `bolsa-trabajo.html` | Vacantes |
| `ser-yaavser.html` | Qué es Yaavser, beneficios, cómo afiliarse, formulario |
| `testimonios.html` | Testimonios de socios |
| `avisos.html` | Avisos y comunicados |
| `activar-chip.html` | RecargaKlic y canales de activación |
| `contacto.html` | Datos de contacto y formulario |

## Cómo verlo

**Importante:** usa un servidor local para que carguen el menú y el pie (`partials/`).

```bash
cd ~/Documents/yaavs-web
python3 -m http.server 8080
```

Abre http://localhost:8080

En VS Code/Cursor: extensión **Live Server** → clic derecho en `index.html` → Open with Live Server.

## Fondo con imagen (inicio)

Capas (de atrás hacia adelante):

1. **Imagen** — `assets/hero-bg.svg` (placeholder) o tu foto `assets/hero-banner.jpg`
2. **Velo negro** — `.page-bg__shade` para que el logo se lea bien
3. **Red de pulso** — canvas `#particle-canvas` en toda la ventana
4. **Contenido** — texto, logo, iconos

**Carrusel (5 imágenes):** guarda en `assets/`:

- `hero-banner-1.jpg` … `hero-banner-5.jpg` (1920×1080 recomendado)

El intervalo y las rutas se editan en `js/hero-carousel.config.js`. Si falta una imagen, se usa `hero-bg.svg` como respaldo.

La clase `page-bg--photo` en el `<body>` aplica un velo un poco más oscuro sobre las fotos.

## Video de presentación

Debajo del manifiesto, bloque a tamaño banner. Configura en `js/presentacion-video.config.js`:

```js
src: "assets/yaavs-presentacion.mp4",
poster: "assets/hero-banner-1.jpg",
```

O pega un enlace de YouTube en `youtube` y deja `src` vacío.

## Estructura

- `styles.css` — estilos globales
- `js/layout.js` — carga header y footer
- `js/main.js` — formularios, animaciones
- `partials/header.html` — navegación
- `partials/footer.html` — pie y redes sociales

## Formularios

Envían correo vía `mailto:Hola@yaavs.com.mx`.
