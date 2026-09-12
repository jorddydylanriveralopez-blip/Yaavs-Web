# 🚀 Instrucciones para Deployar a Vercel

Tu proyecto Yaavs Web está listo para Vercel. Sigue estos pasos:

## **Opción A: Usar GitHub (Recomendado)**

### Paso 1: Instala GitHub CLI (si no lo tienes)
```bash
brew install gh  # En macOS
# O descarga desde: https://cli.github.com
```

### Paso 2: Auténtica GitHub
```bash
gh auth login
# Selecciona: github.com → HTTPS → Y (sí, usar navegador)
```

### Paso 3: Crea el repo y deployea
```bash
cd /private/tmp/claude-501/Yaavs-Web-main
gh repo create yaavs-web --public --source=. --remote=origin --push
```

### Paso 4: Conecta a Vercel
1. Ve a https://vercel.com
2. Click en "New Project"
3. Importa el repo `yaavs-web`
4. Click en "Deploy" ✨

---

## **Opción B: Push Manual a GitHub**

### Paso 1: Crea un nuevo repo en GitHub
1. Ve a https://github.com/new
2. Nombre: `yaavs-web`
3. Privado o Público
4. Click "Create repository"

### Paso 2: Configura el remote y pushea
```bash
cd /private/tmp/claude-501/Yaavs-Web-main
git remote add origin https://github.com/TU_USUARIO/yaavs-web.git
git branch -M main
git push -u origin main
```

### Paso 3: Deployea en Vercel
1. Ve a https://vercel.com
2. Click "New Project"
3. Importa el repo desde GitHub
4. ¡Listo! 🎉

---

## **Opción C: Deployar directamente sin GitHub**

1. Ve a https://vercel.com/new
2. Click en "Deploy from Git" 
3. O sube los archivos directamente
4. El proyecto se deployará automáticamente

---

## **Información del Proyecto**
- 📁 Archivos: 627
- 💾 Tamaño: ~120MB
- 🌐 Tipo: Sitio Estático HTML/CSS/JS
- ⚙️ APIs: /api/chat.js, /api/taecel/*, /api/vaavsti-prompt.js
- 📦 Vercel Config: vercel.json incluido

---

¿Necesitas ayuda con algún paso? 🤔
