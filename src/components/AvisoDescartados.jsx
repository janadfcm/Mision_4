// Aviso del bonus: registros que llegaron del API pero no pasaron el
// esquema Zod. Se muestran aparte, con el motivo, para que se vea que
// el dato corrupto se ha cazado (y no se ha pintado una tarjeta rota).
export default function AvisoDescartados({ descartados }) {
  if (descartados.length === 0) return null;

  return (
    <div role="status" className="aviso aviso-alerta">
      <p>
        🛡️ Zod ha descartado {descartados.length}{" "}
        {descartados.length === 1 ? "anuncio con datos no válidos" : "anuncios con datos no válidos"}.
      </p>
      <details>
        <summary>Ver qué falla</summary>
        <ul>
          {descartados.map(({ id, problemas }) => (
            <li key={id}>
              Anuncio <code>{id}</code>
              <ul>
                {problemas.map((problema) => (
                  <li key={problema}>{problema}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
