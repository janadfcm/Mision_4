// Atributos de accesibilidad comunes a todos los campos.
// - aria-invalid: el lector de pantalla dice «no válido» si hay error.
// - aria-describedby: une el campo con su ayuda y con su mensaje de error
//   (los ids "<campo>-ayuda" y "<campo>-error").
export function ariaCampo(nombre, error, { conAyuda = false } = {}) {
  const descripciones = [conAyuda && `${nombre}-ayuda`, error && `${nombre}-error`].filter(Boolean);
  return {
    "aria-invalid": error ? true : false,
    "aria-describedby": descripciones.length > 0 ? descripciones.join(" ") : undefined,
  };
}
