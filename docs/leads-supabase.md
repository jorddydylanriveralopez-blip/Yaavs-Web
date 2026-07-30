# Leads + cuenta YAAVS (Supabase)

Registro público para Yaavsers, dueños de tienda y emprendedores. Los avisos al teléfono siguen con OneSignal (sin campanita en el menú).

## Proyecto

- Proyecto Supabase: `yaavs-empresa-board`
- URL / anon key: [`js/yaavs-supabase.config.js`](../js/yaavs-supabase.config.js) (solo anon; **nunca** pongas la service role en el front)
- Migración: [`supabase/migrations/20260730_leads.sql`](../supabase/migrations/20260730_leads.sql)

## Auth (Dashboard)

1. Authentication → Providers → **Email** activado.
2. Authentication → URL Configuration:
   - Site URL: `https://royal-blue-gear-650111.hostingersite.com` (o tu dominio)
   - Redirect URLs: `https://…/cuenta.html` y `http://localhost…/cuenta.html` si pruebas en local
3. Si quieres login inmediato sin confirmar correo: desactiva “Confirm email” (Auth → Providers → Email).

## Ver leads (equipo)

1. Supabase → **Table Editor** → `leads`
2. Columnas útiles: `nombre`, `telefono`, `email`, `negocio`, `ciudad`, `estado`, `tipo`, preferencias `interes_*`, `created_at`
3. Exportar: menú de la tabla → Export CSV (teléfonos para llamadas / WhatsApp)

RLS: cada usuario solo lee/edita su fila. El equipo usa el Dashboard (rol service) para ver todos.

## Flujo en el sitio

- Header → **Entrar** / iniciales → [`cuenta.html`](../cuenta.html)
- Registro crea usuario Auth + fila en `leads` (trigger `on_auth_user_created_lead`)
- Preferencias de avisos se sincronizan a tags OneSignal: `interest_promo`, `interest_blog`, `interest_vacante`

## Push segmentado

En OneSignal Dashboard, al enviar un mensaje puedes filtrar por esos tags (`1` = quiere recibir). Guía de publicación: [`docs/alertas-yaavs.md`](alertas-yaavs.md).
