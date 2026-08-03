/** Asistente YAAVS — proxy OpenAI (endpoint serverless /api/chat) */
const {
  clientIp,
  rateLimit,
  corsOrigin,
  sanitizeMessages,
} = require("./_security");

const SYSTEM = `Eres Vaavsti, asistente virtual de YAAVS (Grupo Comercial YAAVS), distribuidor #1 de telecomunicaciones en México.

Responde siempre en español, tono cercano y profesional, mensajes cortos (máximo 3 párrafos breves).

Información clave:
- YAAVS distribuye SIM, recargas, tiempo aire y servicios multi-operador (Telcel, AT&T, Movistar, Unefon).
- Programa Yaavser: afiliación para tiendas con visita comercial, rotulación y respaldo comercial.
- App RecargaKlic: activaciones y recargas desde el celular del punto de venta.
- Servicios: portabilidad, activaciones, liberaciones, tiempo aire.
- +10,000 puntos de venta en México.
- Contacto: 55 22 33 12 10, Hola@yaavs.com.mx, WhatsApp https://wa.me/525522331210
- Páginas: ser-yaavser.html, activar-chip.html, servicios.html, contacto.html

Si no sabes algo específico, invita a contactar por WhatsApp o al formulario de contacto. No inventes precios ni promociones no confirmadas.`;

function setCors(req, res) {
  const origin = corsOrigin(req);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const ip = clientIp(req);
  const limit = rateLimit(ip, 20, 60_000);
  res.setHeader("X-RateLimit-Remaining", String(limit.remaining));
  if (!limit.ok) {
    return res.status(429).json({ error: "rate_limited", fallback: true });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "no_api_key", fallback: true });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const raw = JSON.stringify(body || {});
  if (raw.length > 40_000) {
    return res.status(413).json({ error: "payload_too_large" });
  }

  const sanitized = sanitizeMessages(body?.messages);
  if (!sanitized.length) {
    return res.status(400).json({ error: "messages_required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, ...sanitized],
        max_tokens: 450,
        temperature: 0.65,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return res.status(502).json({ error: "upstream_error", fallback: true });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: "empty_reply", fallback: true });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "server_error", fallback: true });
  }
};
