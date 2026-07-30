/**
 * OneSignal Web Push — configuración YAAVS
 *
 * 1. Crea una app en https://onesignal.com (plataforma Web)
 * 2. Pega tu App ID abajo
 * 3. En OneSignal → Settings → Platforms → Web → Site URL = tu dominio Hostinger
 * 4. Service Worker path: / (usamos sw.js en la raíz; ver docs/alertas-yaavs.md)
 * 5. Deja appId vacío "" para desactivar push hasta tener la cuenta lista
 */
window.YAAVS_ONESIGNAL = {
  appId: "",
  safariWebId: "",
  allowLocalhostAsSecureOrigin: false,
};
