// Única puerta de salida hacia el API. Todas las peticiones pasan por aquí,
// así que los errores se tratan igual en toda la app.
const BASE = "http://localhost:3000";

export async function pedir(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(`${BASE}${ruta}`, opciones);
  } catch {
    // fetch solo lanza si NO hay respuesta (servidor apagado, sin red…).
    throw new Error("No se puede conectar con el servidor. ¿Has arrancado la API con «npm run api»?");
  }
  // Un 404 o un 500 NO hacen que fetch lance: hay que mirar response.ok.
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status} ${respuesta.statusText}`.trim());
  }
  return respuesta.json();
}
