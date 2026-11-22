import { pedir } from "./cliente.js";

// GET /esquejes, del más nuevo al más antiguo y, si hay ciudad, solo los suyos.
export function obtenerEsquejes(ciudadId) {
  const parametros = new URLSearchParams({ _sort: "-publicadoEn" });
  if (ciudadId) parametros.set("ciudadId", ciudadId);
  return pedir(`/esquejes?${parametros}`);
}

// POST /esquejes. json-server le pone el id y devuelve el registro creado.
export function crearEsqueje(datos) {
  return pedir("/esquejes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datos, publicadoEn: new Date().toISOString() }),
  });
}

// DELETE /esquejes/:id
export function retirarEsqueje(id) {
  return pedir(`/esquejes/${encodeURIComponent(id)}`, { method: "DELETE" });
}
