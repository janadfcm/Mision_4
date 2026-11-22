import { useState } from "react";
import { useCiudades } from "../hooks/useCiudades.js";
import { useEsquejes, useRetirarEsqueje } from "../hooks/useEsquejes.js";
import AvisoDescartados from "./AvisoDescartados.jsx";
import TarjetaEsqueje from "./TarjetaEsqueje.jsx";

export default function Tablon() {
  // "" = todas las ciudades. Es estado normal de React: cambia la clave
  // de la query y TanStack se encarga de pedir la lista que toca.
  const [ciudadId, setCiudadId] = useState("");
  const ciudades = useCiudades();
  const esquejes = useEsquejes(ciudadId);
  const retirar = useRetirarEsqueje();

  // id → nombre, para enseñar «Madrid» en vez de "madrid".
  const nombreCiudad = Object.fromEntries((ciudades.data ?? []).map((c) => [c.id, c.nombre]));

  return (
    <section className="panel" aria-labelledby="titulo-tablon">
      <div className="tablon-cabecera">
        <h2 id="titulo-tablon">Tablón de esquejes</h2>
        <label className="filtro">
          Ciudad{" "}
          <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)}>
            <option value="">Todas</option>
            {ciudades.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* isPending: aún no hay NINGÚN dato (primera carga). */}
      {esquejes.isPending && <p role="status">Cargando anuncios…</p>}

      {esquejes.isError && (
        <div role="alert" className="aviso aviso-error">
          <p>No se han podido cargar los anuncios: {esquejes.error.message}</p>
          <button type="button" onClick={() => esquejes.refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {retirar.isError && (
        <p role="alert" className="aviso aviso-error">
          No se ha podido retirar el anuncio: {retirar.error.message}
        </p>
      )}

      {esquejes.isSuccess && (
        <>
          {/* isFetching sin isPending: hay datos y se están actualizando. */}
          <p className="contador" aria-live="polite">
            {esquejes.isFetching
              ? "Actualizando…"
              : `${esquejes.data.esquejes.length} ${esquejes.data.esquejes.length === 1 ? "anuncio" : "anuncios"}`}
          </p>

          <AvisoDescartados descartados={esquejes.data.descartados} />

          {esquejes.data.esquejes.length === 0 ? (
            <p className="vacio">Aún no hay plantas en esta ciudad. ¡Publica la primera!</p>
          ) : (
            <div className="lista">
              {esquejes.data.esquejes.map((esqueje) => (
                <TarjetaEsqueje
                  key={esqueje.id}
                  esqueje={esqueje}
                  ciudad={nombreCiudad[esqueje.ciudadId]}
                  onRetirar={() => retirar.mutate(esqueje.id)}
                  // La mutación es compartida: variables dice QUÉ id se está borrando.
                  retirando={retirar.isPending && retirar.variables === esqueje.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
