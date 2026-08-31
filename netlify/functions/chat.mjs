/** Yaavsti — proxy OpenAI (Netlify Functions) */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  rateLimit,
  corsOrigin,
  sanitizeMessages,
} = require("../../api/_security.js");
const SYSTEM = require("../../api/vaavsti-prompt.js");

function clientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function corsHeaders(req) {
  const origin = corsOrigin({ headers: { origin: req.headers.get("origin") || "" } });
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  return headers;
}

function json(req, data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(req), ...extra },
  });
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req),
    });
  }

  if (req.method !== "POST") {
    return json(req, { error: "method_not_allowed" }, 405);
  }

  const ip = clientIp(req);
  const limit = rateLimit(ip, 20, 60_000);
  if (!limit.ok) {
    return json(
      req,
      { error: "rate_limited", fallback: true },
      429,
      { "X-RateLimit-Remaining": "0" }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(req, { error: "no_api_key", fallback: true }, 503);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "invalid_json" }, 400);
  }

  const raw = JSON.stringify(body || {});
  if (raw.length > 40_000) {
    return json(req, { error: "payload_too_large" }, 413);
  }

  const sanitized = sanitizeMessages(body?.messages);
  if (!sanitized.length) {
    return json(req, { error: "messages_required" }, 400);
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
        max_tokens: 520,
        temperature: 0.78,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return json(req, { error: "upstream_error", fallback: true }, 502);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return json(req, { error: "empty_reply", fallback: true }, 502);
    }

    return json(req, { reply }, 200, {
      "X-RateLimit-Remaining": String(limit.remaining),
    });
  } catch (err) {
    console.error("Chat handler error:", err);
    return json(req, { error: "server_error", fallback: true }, 500);
  }
};

export const config = {
  path: "/api/chat",
};
