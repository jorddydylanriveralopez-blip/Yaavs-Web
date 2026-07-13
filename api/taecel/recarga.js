/** Ejecuta recarga de tiempo aire vía TAECEL (o demo seguro) */
const { cors, requestTopup } = require("./_client");

module.exports = async function handler(req, res) {
  cors(res, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "invalid_json", message: "JSON inválido." });
  }

  const productId = String(body?.productId || "").trim();
  const phone = String(body?.phone || "").trim();

  if (!productId || !phone) {
    return res.status(400).json({
      error: "missing_fields",
      message: "Indica producto y número celular.",
    });
  }

  const result = await requestTopup({ productId, phone });
  return res.status(result.status).json(result);
};
