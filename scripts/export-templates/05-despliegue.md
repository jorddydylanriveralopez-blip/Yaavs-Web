# 05 — Despliegue / exportación

## Opción A — ZIP para entregar

1. Ejecuta `./scripts/exportar-sitio.sh` en el repo.  
2. Entrega `entrega/yaavs-web-YYYYMMDD.zip`.  
3. El receptor descomprime y usa la carpeta `sitio/`.

## Opción B — Hostinger (FTP / File Manager)

1. Entra a `sitio/`.  
2. Sube **todo el contenido** a `public_html` (o la carpeta del dominio).  
3. Conserva `.htaccess` si el hosting es Apache.  
4. No subas `docs/` ni este LEEME al hosting (solo `sitio/`).

## Opción C — Vercel

```bash
cd sitio
npx vercel --prod --yes
```

O desde el repo original (ya vinculado): `npx vercel --prod --yes`.

## Opción D — Netlify

Usa `netlify.toml` dentro de `sitio/` o arrastra la carpeta `sitio/` al dashboard.

## Checklist rápido

- [ ] Abrir `index.html` vía servidor local  
- [ ] Menú y pie cargan (`partials/`)  
- [ ] Home, Quiénes somos, Tiendas, Anuncios, Contacto OK  
- [ ] Imágenes y videos se ven  
- [ ] Cookies / PWA no rompen la página  
- [ ] No hay archivos `.env` en la entrega  
