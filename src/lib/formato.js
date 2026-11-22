// Textos que ve el usuario para cada valor guardado.
export const ETIQUETAS = {
  tipo: { esqueje: "Esqueje", planta: "Planta", semillas: "Semillas" },
  luz: { sombra: "Sombra", indirecta: "Luz indirecta", directa: "Sol directo" },
  modalidad: { intercambio: "Intercambio", regalo: "Regalo" },
};

// "2026-11-25" → "25 nov". Se añade la hora para que se lea en hora local.
export function fechaCorta(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}
