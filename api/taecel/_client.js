/**
 * Adaptador TAECEL — claves solo en servidor.
 * Los endpoints exactos los confirma TAECEL tras el levantamiento tecnológico.
 * Mientras no haya KEY/NIP o TAECEL_DEMO=1, operamos en modo demo.
 */

const DEFAULT_PRODUCTS = [
  {
    carrier: "telcel",
    label: "Telcel",
    products: [
      { id: "telcel-20", name: "Recarga $20", amount: 20 },
      { id: "telcel-30", name: "Recarga $30", amount: 30 },
      { id: "telcel-50", name: "Recarga $50", amount: 50 },
      { id: "telcel-100", name: "Recarga $100", amount: 100 },
      { id: "telcel-200", name: "Recarga $200", amount: 200 },
    ],
  },
  {
    carrier: "att",
    label: "AT&T",
    products: [
      { id: "att-20", name: "Recarga $20", amount: 20 },
      { id: "att-50", name: "Recarga $50", amount: 50 },
      { id: "att-100", name: "Recarga $100", amount: 100 },
      { id: "att-200", name: "Recarga $200", amount: 200 },
    ],
  },
  {
    carrier: "movistar",
    label: "Movistar",
    products: [
      { id: "movistar-20", name: "Recarga $20", amount: 20 },
      { id: "movistar-50", name: "Recarga $50", amount: 50 },
      { id: "movistar-100", name: "Recarga $100", amount: 100 },
      { id: "movistar-200", name: "Recarga $200", amount: 200 },
    ],
  },
  {
    carrier: "unefon",
    label: "Unefon",
    products: [
      { id: "unefon-20", name: "Recarga $20", amount: 20 },
      { id: "unefon-50", name: "Recarga $50", amount: 50 },
      { id: "unefon-100", name: "Recarga $100", amount: 100 },
    ],
  },
  {
    carrier: "bait",
    label: "BAIT",
    products: [
      { id: "bait-20", name: "Recarga $20", amount: 20 },
      { id: "bait-50", name: "Recarga $50", amount: 50 },
      { id: "bait-100", name: "Recarga $100", amount: 100 },
    ],
  },
];

function getCredentials() {
  const key = String(process.env.TAECEL_KEY || "").trim();
  const nip = String(process.env.TAECEL_NIP || "").trim();
  const apiBase = String(process.env.TAECEL_API_BASE || "").trim().replace(/\/?$/, "/");
  const demoFlag = String(process.env.TAECEL_DEMO || "").trim();
  const demoForced = demoFlag === "1" || demoFlag.toLowerCase() === "true";
  const live = Boolean(key && nip && apiBase && !demoForced);
  return { key, nip, apiBase, live, demo: !live };
}

function findProduct(productId) {
  for (const group of DEFAULT_PRODUCTS) {
    const hit = group.products.find((p) => p.id === productId);
    if (hit) return { ...hit, carrier: group.carrier, carrierLabel: group.label };
  }
  return null;
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

function validatePhone(phone) {
  const digits = normalizePhone(phone);
  return /^[1-9]\d{9}$/.test(digits) ? digits : null;
}

async function fetchProducts() {
  const creds = getCredentials();
  if (creds.demo) {
    return { demo: true, carriers: DEFAULT_PRODUCTS };
  }

  // Contrato provisional: GET/POST productos según docs TAECEL.
  // Cuando entreguen el contrato exacto, mapear aquí sin cambiar el front.
  try {
    const url = new URL("getProducts", creds.apiBase);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: creds.key, nip: creds.nip }),
    });
    if (!response.ok) {
      console.error("TAECEL products status:", response.status);
      return { demo: false, carriers: DEFAULT_PRODUCTS, warning: "catalog_fallback" };
    }
    const data = await response.json();
    if (Array.isArray(data?.carriers) && data.carriers.length) {
      return { demo: false, carriers: data.carriers };
    }
  } catch (err) {
    console.error("TAECEL products error:", err);
  }
  return { demo: false, carriers: DEFAULT_PRODUCTS, warning: "catalog_fallback" };
}

async function requestTopup({ productId, phone }) {
  const creds = getCredentials();
  const product = findProduct(productId);
  if (!product) {
    return { ok: false, status: 400, error: "invalid_product", message: "Producto no válido." };
  }
  const msisdn = validatePhone(phone);
  if (!msisdn) {
    return {
      ok: false,
      status: 400,
      error: "invalid_phone",
      message: "Ingresa un celular mexicano a 10 dígitos.",
    };
  }

  if (creds.demo) {
    const folio = `DEMO-${Date.now().toString(36).toUpperCase()}`;
    return {
      ok: true,
      status: 200,
      demo: true,
      folio,
      carrier: product.carrierLabel,
      product: product.name,
      amount: product.amount,
      phone: msisdn,
      message:
        "Recarga de demostración. Configura TAECEL_KEY, TAECEL_NIP y TAECEL_API_BASE en Vercel (TAECEL_DEMO=0) para operar con saldo real.",
    };
  }

  try {
    const url = new URL("RequestTX", creds.apiBase);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: creds.key,
        nip: creds.nip,
        producto: productId,
        referencia: msisdn,
        monto: product.amount,
      }),
    });

    const raw = await response.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      console.error("TAECEL RequestTX status:", response.status, raw);
      return {
        ok: false,
        status: 502,
        error: "upstream_error",
        message: data?.message || "TAECEL rechazó la operación. Intenta de nuevo o contacta soporte.",
      };
    }

    const folio = data.folio || data.transID || data.id || data.Folio || null;
    const success =
      data.success === true ||
      data.status === "ok" ||
      data.success === 1 ||
      Boolean(folio);

    if (!success) {
      return {
        ok: false,
        status: 422,
        error: "tx_failed",
        message: data.message || data.error || "No se pudo completar la recarga.",
      };
    }

    return {
      ok: true,
      status: 200,
      demo: false,
      folio: folio || `TX-${Date.now()}`,
      carrier: product.carrierLabel,
      product: product.name,
      amount: product.amount,
      phone: msisdn,
      message: "Recarga aplicada correctamente.",
    };
  } catch (err) {
    console.error("TAECEL RequestTX error:", err);
    return {
      ok: false,
      status: 500,
      error: "server_error",
      message: "Error de conexión con TAECEL.",
    };
  }
}

function cors(res, methods = "GET, POST, OPTIONS") {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = {
  DEFAULT_PRODUCTS,
  getCredentials,
  fetchProducts,
  requestTopup,
  cors,
};
