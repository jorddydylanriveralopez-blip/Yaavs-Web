/** Ejecuta recarga de tiempo aire vía TAECEL (o demo seguro) */
const { cors, requestTopup } = require("./_client");
const { clientIp, rateLimit } = require("../_security");

module.exports = async function handler(req, res) {
  cors(res, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const limit = rateLimit(clientIp(req), 8, 60_000);
  if (!limit.ok) {
    return res.status(429).json({
      error: "rate_limited",
      message: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
    });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "invalid_json", message: "JSON inválido." });
  }

  const productId = String(body?.productId || "").trim().slice(0, 64);
  const phone = String(body?.phone || "").trim().slice(0, 20);

  if (!productId || !phone) {
    return res.status(400).json({
      error: "missing_fields",
      message: "Indica producto y número celular.",
    });
  }

  if (!/^\d{10,12}$/.test(phone.replace(/\D/g, ""))) {
    return res.status(400).json({
      error: "invalid_phone",
      message: "Número celular inválido.",
    });
  }

  const result = await requestTopup({ productId, phone });
  return res.status(result.status).json(result);
};
