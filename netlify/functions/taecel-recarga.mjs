import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { requestTopup } = require("../../api/taecel/_client.js");

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

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json", message: "JSON inválido." }, 400);
  }

  const productId = String(body?.productId || "").trim();
  const phone = String(body?.phone || "").trim();

  if (!productId || !phone) {
    return json(
      {
        error: "missing_fields",
        message: "Indica producto y número celular.",
      },
      400
    );
  }

  const result = await requestTopup({ productId, phone });
  return json(result, result.status || 200);
};

export const config = {
  path: "/api/taecel/recarga",
};
