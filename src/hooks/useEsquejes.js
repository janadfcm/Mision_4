import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearEsqueje, obtenerEsquejes, retirarEsqueje } from "../api/esquejes.js";
import { claves } from "./claves.js";

// Lista de anuncios. La ciudad forma parte de la clave: cada filtro tiene
// su propia entrada en la caché y, al volver a uno ya visto, sale al instante.
export function useEsquejes(ciudadId) {
  return useQuery({
    queryKey: claves.esquejesDe(ciudadId),
    queryFn: () => obtenerEsquejes(ciudadId),
    // Al cambiar de filtro, seguir enseñando la lista anterior mientras
    // llega la nueva, en vez de vaciar la pantalla con «Cargando…».
    placeholderData: keepPreviousData,
  });
}

export function useCrearEsqueje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearEsqueje,
    // Tras crear, las listas guardadas en caché ya no son ciertas:
    // las marcamos como viejas y TanStack vuelve a pedir la que está en pantalla.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: claves.esquejes }),
  });
}

export function useRetirarEsqueje() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retirarEsqueje,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: claves.esquejes }),
  });
}
