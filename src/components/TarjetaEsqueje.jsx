import { ETIQUETAS, fechaCorta } from "../lib/formato.js";

export default function TarjetaEsqueje({ esqueje, ciudad, onRetirar, retirando }) {
  const { especie, tipo, luz, riegoDias, modalidad, buscaACambio, descripcion, aptaMascotas } = esqueje;

  return (
    <article className="tarjeta">
      <header className="tarjeta-cabecera">
        <h3>{especie}</h3>
        <span className={`etiqueta etiqueta-${modalidad}`}>{ETIQUETAS.modalidad[modalidad]}</span>
      </header>

      <ul className="tarjeta-datos">
        <li>🌱 {ETIQUETAS.tipo[tipo]}</li>
        <li>☀️ {ETIQUETAS.luz[luz]}</li>
        <li>💧 Cada {riegoDias} {riegoDias === 1 ? "día" : "días"}</li>
        <li>{aptaMascotas ? "🐾 Apta para mascotas" : "⚠️ No apta para mascotas"}</li>
      </ul>

      {modalidad === "intercambio" && buscaACambio && (
        <p className="tarjeta-cambio">
          <strong>Busca a cambio:</strong> {buscaACambio}
        </p>
      )}
      {descripcion && <p>{descripcion}</p>}

      <footer className="tarjeta-pie">
        <span>
          📍 {ciudad ?? "Ciudad desconocida"} · desde el {fechaCorta(esqueje.disponibleDesde)}
        </span>
        <a href={`mailto:${esqueje.contacto}`}>Contactar</a>
        <button type="button" className="boton-secundario" onClick={onRetirar} disabled={retirando}>
          {retirando ? "Retirando…" : "Retirar"}
        </button>
      </footer>
    </article>
  );
}
