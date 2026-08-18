/** Catálogo de productos / montos TAECEL */
const { cors, fetchProducts, getCredentials } = require("./_client");
const { clientIp, rateLimit } = require("../_security");

module.exports = async function handler(req, res) {
  cors(res, "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const limit = rateLimit(clientIp(req), 40, 60_000);
  if (!limit.ok) {
    return res.status(429).json({ error: "rate_limited" });
  }

  try {
    const catalog = await fetchProducts();
    const creds = getCredentials();
    return res.status(200).json({
      ...catalog,
      mode: creds.demo ? "demo" : "live",
    });
  } catch (err) {
    console.error("taecel/productos:", err);
    return res.status(500).json({ error: "server_error" });
  }
};
