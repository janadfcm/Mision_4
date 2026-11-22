// Las claves de TanStack Query, en un único sitio.
// Son jerárquicas: ["esquejes", { ciudadId: "madrid" }] empieza por
// ["esquejes"], así que invalidar ["esquejes"] invalida TODAS las listas
// (la general y las filtradas por cualquier ciudad).
export const claves = {
  ciudades: ["ciudades"],
  esquejes: ["esquejes"],
  esquejesDe: (ciudadId) => ["esquejes", { ciudadId }],
};
