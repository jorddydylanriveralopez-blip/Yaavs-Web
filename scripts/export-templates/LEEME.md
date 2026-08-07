# Entrega YAAVS Web

Paquete listo para exportar, revisar o subir a Hostinger / Netlify.

## Contenido

| Ruta | Qué es |
|------|--------|
| `sitio/` | Copia **funcional** del sitio (mismas rutas que producción) |
| `docs/` | Mapa ordenado: páginas, CSS, JS, assets y despliegue |
| `LEEME.md` | Este archivo |

## Orden recomendado al revisar

1. `docs/01-orden-del-sitio.md` — mapa del recorrido del usuario  
2. `docs/02-paginas.md` — cada HTML y su rol  
3. `docs/03-estilos-y-scripts.md` — CSS / JS por área  
4. `docs/04-assets.md` — imágenes, video, PWA  
5. `docs/05-despliegue.md` — cómo publicar  
6. `docs/06-inventario.md` — listado generado al exportar  

## Cómo abrir en local

```bash
cd sitio
python3 -m http.server 8080
```

Abre http://localhost:8080  

> Los `partials/` (menú y pie) solo cargan con servidor local, no con `file://`.

## Cómo volver a generar esta entrega

Desde la raíz del repo:

```bash
./scripts/exportar-sitio.sh
```

Genera de nuevo `entrega/yaavs-web/` y un ZIP fechado en `entrega/`.

## Importante

- No incluye `.env`, `.git` ni `version-anterior`.
- Para Hostinger: sube el **contenido** de `sitio/` (no la carpeta `docs/`), o sincroniza desde GitHub `main`.
- URL de referencia: https://www.yaavs.com.mx  
