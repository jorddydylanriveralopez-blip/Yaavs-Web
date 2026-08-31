import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { fetchProducts, getCredentials } = require("../../api/taecel/_client.js");

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "GET") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const catalog = await fetchProducts();
    const creds = getCredentials();
    return json({
      ...catalog,
      mode: creds.demo ? "demo" : "live",
    });
  } catch (err) {
    console.error("taecel/productos:", err);
    return json({ error: "server_error" }, 500);
  }
};

export const config = {
  path: "/api/taecel/productos",
};
