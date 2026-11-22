import { esquemaEsqueje } from "../schemas/esqueje.js";
import { pedir } from "./cliente.js";

// GET /esquejes, del más nuevo al más antiguo y, si hay ciudad, solo los suyos.
//
// BONUS: no nos fiamos de lo que llega. Cada registro pasa por
// esquemaEsqueje.safeParse(), que NO lanza: devuelve { success, data, error }.
// - Los válidos se enseñan.
// - Los corruptos se apartan y se cuentan, con los campos que fallan,
//   para avisar en pantalla en vez de romper la tarjeta (o la app entera).
export async function obtenerEsquejes(ciudadId) {
  const parametros = new URLSearchParams({ _sort: "-publicadoEn" });
  if (ciudadId) parametros.set("ciudadId", ciudadId);
  const json = await pedir(`/esquejes?${parametros}`);

  // Si ni siquiera es una lista, no hay nada que salvar: error de la query.
  if (!Array.isArray(json)) {
    throw new Error("La respuesta del servidor no es una lista de anuncios");
  }

  const validos = [];
  const descartados = [];
  for (const registro of json) {
    const resultado = esquemaEsqueje.safeParse(registro);
    if (resultado.success) {
      validos.push(resultado.data);
    } else {
      descartados.push({
        id: registro?.id ?? "(sin id)",
        problemas: resultado.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      });
    }
  }
  return { esquejes: validos, descartados };
}

// POST /esquejes. json-server le pone el id y devuelve el registro creado,
// que también se valida: si el servidor devolviera basura, lo sabríamos.
export async function crearEsqueje(datos) {
  const creado = await pedir("/esquejes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datos, publicadoEn: new Date().toISOString() }),
  });
  const resultado = esquemaEsqueje.safeParse(creado);
  if (!resultado.success) {
    throw new Error("El servidor ha guardado el anuncio, pero ha devuelto datos no válidos");
  }
  return resultado.data;
}

// DELETE /esquejes/:id
export function retirarEsqueje(id) {
  return pedir(`/esquejes/${encodeURIComponent(id)}`, { method: "DELETE" });
}
