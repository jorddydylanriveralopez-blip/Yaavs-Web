/**
 * Google Apps Script — Solicitudes Yaavser → Google Sheets
 *
 * Setup:
 * 1. Crea un Google Sheet (o usa uno existente).
 * 2. Extensiones → Apps Script → pega este código.
 * 3. Guardar → Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquiera
 * 4. Copia la URL /exec y pégala en js/yaavser-lead.config.js → endpoint
 *
 * Columnas: Timestamp | Nombre | Negocio | Estado | Email | Teléfono
 */

var SHEET_NAME = "Solicitudes Yaavser";

function doOptions() {
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, service: "yaavser-lead" });
}

function doPost(e) {
  try {
    var data = parseBody_(e);
    var nombre = String(data.nombre || "").trim();
    var negocio = String(data.negocio || "").trim();
    var estado = String(data.estado || "").trim();
    var email = String(data.email || "").trim();
    var telefono = String(data.telefono || "").trim();

    if (!nombre || !negocio || !estado || !email || !telefono) {
      return json_({ ok: false, error: "Faltan campos requeridos" });
    }

    var sheet = getOrCreateSheet_();
    sheet.appendRow([
      new Date(),
      nombre,
      negocio,
      estado,
      email,
      telefono,
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parseBody_(e) {
  if (!e) return {};
  if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
  var raw = (e.postData && e.postData.contents) || "";
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Nombre",
      "Negocio",
      "Estado",
      "Email",
      "Teléfono",
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
