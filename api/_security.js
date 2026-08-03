/**
 * Utilidades de protección para /api/chat
 * (rate limit en memoria + origen permitido + sanitizado).
 */

const ALLOWED_ORIGIN_RE =
  /^(https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|([a-z0-9-]+\.)*yaavs\.com\.mx|([a-z0-9-]+\.)*yaavs\.com|royal-blue-gear-650111\.hostingersite\.com))$/i;

const buckets = new Map();

function clientIp(req) {
  const xf = req.headers?.["x-forwarded-for"] || req.headers?.get?.("x-forwarded-for");
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.headers?.["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function rateLimit(ip, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  let entry = buckets.get(ip);
  if (!entry || now > entry.reset) {
    entry = { count: 0, reset: now + windowMs };
  }
  entry.count += 1;
  buckets.set(ip, entry);

  if (buckets.size > 5000) {
    for (const [key, val] of buckets) {
      if (now > val.reset) buckets.delete(key);
    }
  }

  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.reset,
  };
}

function corsOrigin(req) {
  const origin =
    req.headers?.origin ||
    req.headers?.get?.("origin") ||
    "";
  if (!origin) return "";
  if (ALLOWED_ORIGIN_RE.test(origin)) return origin;
  return "";
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 1500).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""),
    }));
}

module.exports = {
  clientIp,
  rateLimit,
  corsOrigin,
  sanitizeMessages,
  ALLOWED_ORIGIN_RE,
};
