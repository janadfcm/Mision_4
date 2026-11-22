import { esquemaCiudades } from "../schemas/esqueje.js";
import { pedir } from "./cliente.js";

// Las ciudades rellenan el select del formulario. Si llegan mal, el
// formulario no sirve: aquí sí lanzamos y la query pasa a estado de error.
export async function obtenerCiudades() {
  const json = await pedir("/ciudades");
  const resultado = esquemaCiudades.safeParse(json);
  if (!resultado.success) {
    throw new Error("Las ciudades recibidas no tienen el formato esperado");
  }
  return resultado.data;
}
