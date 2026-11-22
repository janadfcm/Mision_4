import { useQuery } from "@tanstack/react-query";
import { obtenerCiudades } from "../api/ciudades.js";
import { claves } from "./claves.js";

export function useCiudades() {
  return useQuery({
    queryKey: claves.ciudades,
    queryFn: obtenerCiudades,
    // Las ciudades no cambian mientras se usa la app: no hace falta
    // volver a pedirlas nunca (ni al volver a la pestaña).
    staleTime: Infinity,
  });
}
