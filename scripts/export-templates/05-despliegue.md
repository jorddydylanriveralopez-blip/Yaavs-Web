# 05 — Despliegue / exportación

## Opción A — ZIP para entregar

1. Ejecuta `./scripts/exportar-sitio.sh` en el repo.  
2. Entrega `entrega/yaavs-web-YYYYMMDD.zip`.  
3. El receptor descomprime y usa la carpeta `sitio/`.

## Opción B — Hostinger (recomendado)

1. El sitio se publica desde GitHub: push a `origin/main` y Hostinger sincroniza.  
2. O sube por FTP / File Manager el **contenido** de `sitio/` a `public_html`.  
3. Conserva `.htaccess` si el hosting es Apache.  
4. No subas `docs/` ni este LEEME al hosting (solo el sitio).

## Opción C — Netlify (alternativa)

Usa `netlify.toml` dentro de `sitio/` o arrastra la carpeta `sitio/` al dashboard.

## Checklist rápido

- [ ] Abrir `index.html` vía servidor local  
- [ ] Menú y pie cargan (`partials/`)  
- [ ] Home, Quiénes somos, Tiendas, Anuncios, Contacto OK  
- [ ] Imágenes y videos se ven  
- [ ] Cookies / PWA no rompen la página  
- [ ] No hay archivos `.env` en la entrega  
