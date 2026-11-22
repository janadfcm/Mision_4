import { pedir } from "./cliente.js";

export function obtenerCiudades() {
  return pedir("/ciudades");
}
