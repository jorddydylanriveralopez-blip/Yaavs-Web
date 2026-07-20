/** YaavBot — proxy OpenAI (Netlify Functions) */
const SYSTEM = `Eres YaavBot, asistente virtual de YAAVS (Grupo Comercial YAAVS), distribuidor #1 de telecomunicaciones en México.

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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "no_api_key", fallback: true }, 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (!messages.length) {
    return json({ error: "messages_required" }, 400);
  }

  const sanitized = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  if (!sanitized.length) {
    return json({ error: "messages_required" }, 400);
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
      return json({ error: "upstream_error", fallback: true }, 502);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return json({ error: "empty_reply", fallback: true }, 502);
    }

    return json({ reply });
  } catch (err) {
    console.error("Chat handler error:", err);
    return json({ error: "server_error", fallback: true }, 500);
  }
};

export const config = {
  path: "/api/chat",
};
