import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaFormulario, esToxica, hoyISO, LUCES, MODALIDADES, TIPOS } from "../schemas/esqueje.js";
import { useCiudades } from "../hooks/useCiudades.js";
import { useCrearEsqueje } from "../hooks/useEsquejes.js";
import { ETIQUETAS } from "../lib/formato.js";
import { ariaCampo } from "../lib/aria.js";
import MensajeError from "./MensajeError.jsx";

// Valores con los que empieza (y a los que vuelve tras reset()).
// "" en tipo, luz y ciudad = «sin elegir»: Zod lo rechaza con su mensaje.
const VALORES_INICIALES = {
  especie: "",
  tipo: "",
  luz: "",
  riegoDias: "",
  modalidad: "regalo",
  buscaACambio: "",
  ciudadId: "",
  disponibleDesde: hoyISO(),
  contacto: "",
  descripcion: "",
  aptaMascotas: false,
};

const MAX_DESCRIPCION = 300;

export default function FormularioEsqueje() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitted },
  } = useForm({
    // Toda la validación la hace Zod: los inputs no llevan reglas.
    resolver: zodResolver(esquemaFormulario),
    defaultValues: VALORES_INICIALES,
    // Valida al salir de cada campo y, desde ahí, mientras se escribe.
    // Así no salen errores rojos antes de que el usuario haya tocado nada.
    mode: "onTouched",
  });

  const ciudades = useCiudades();
  const crear = useCrearEsqueje();

  // useWatch lee valores EN VIVO (re-renderiza al cambiar), para la UI que
  // depende de lo que se está escribiendo.
  const [modalidad, especie, descripcion] = useWatch({
    control,
    name: ["modalidad", "especie", "descripcion"],
  });

  // Solo se llama si Zod da el visto bueno: "datos" ya viene validado y
  // transformado (riegoDias es número, textos sin espacios sobrantes).
  function onSubmit(datos) {
    // Si al final es un regalo, no guardar lo que se escribiera en «a cambio».
    const anuncio = datos.modalidad === "regalo" ? { ...datos, buscaACambio: "" } : datos;
    crear.mutate(anuncio, {
      onSuccess: () => reset(),
    });
  }

  const numErrores = Object.keys(errors).length;

  return (
    <section className="panel" aria-labelledby="titulo-formulario">
      <h2 id="titulo-formulario">Publica un esqueje</h2>

      {/* noValidate: desactiva los globos del navegador; los errores los pone Zod. */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="formulario">
        {isSubmitted && numErrores > 0 && (
          <p role="alert" className="aviso aviso-error">
            Revisa {numErrores === 1 ? "el campo marcado" : `los ${numErrores} campos marcados`}.
          </p>
        )}

        {/* ── Especie ───────────────────────────────────────── */}
        <div className="campo">
          <label htmlFor="especie">Especie *</label>
          <input
            id="especie"
            type="text"
            placeholder="Pothos, cinta, albahaca…"
            autoComplete="off"
            {...ariaCampo("especie", errors.especie, { conAyuda: esToxica(especie) })}
            {...register("especie")}
          />
          {esToxica(especie) && (
            <p id="especie-ayuda" className="ayuda">
              🐾 Ojo: esta planta es tóxica para perros y gatos.
            </p>
          )}
          <MensajeError nombre="especie" error={errors.especie} />
        </div>

        {/* ── Tipo (radios): fieldset + legend agrupan las opciones ── */}
        <fieldset className="campo" aria-describedby={errors.tipo ? "tipo-error" : undefined}>
          <legend>¿Qué ofreces? *</legend>
          <div className="opciones">
            {TIPOS.map((tipo) => (
              <label key={tipo} className="opcion">
                <input type="radio" value={tipo} aria-invalid={errors.tipo ? true : false} {...register("tipo")} />
                {ETIQUETAS.tipo[tipo]}
              </label>
            ))}
          </div>
          <MensajeError nombre="tipo" error={errors.tipo} />
        </fieldset>

        <div className="fila">
          {/* ── Luz (select) ───────────────────────────────── */}
          <div className="campo">
            <label htmlFor="luz">Luz *</label>
            <select id="luz" {...ariaCampo("luz", errors.luz)} {...register("luz")}>
              <option value="">Elige…</option>
              {LUCES.map((luz) => (
                <option key={luz} value={luz}>
                  {ETIQUETAS.luz[luz]}
                </option>
              ))}
            </select>
            <MensajeError nombre="luz" error={errors.luz} />
          </div>

          {/* ── Riego (número) ─────────────────────────────── */}
          <div className="campo">
            <label htmlFor="riegoDias">Riego cada (días) *</label>
            <input
              id="riegoDias"
              type="number"
              inputMode="numeric"
              {...ariaCampo("riegoDias", errors.riegoDias)}
              {...register("riegoDias")}
            />
            <MensajeError nombre="riegoDias" error={errors.riegoDias} />
          </div>
        </div>

        {/* ── Modalidad (radios) ──────────────────────────────── */}
        <fieldset className="campo" aria-describedby={errors.modalidad ? "modalidad-error" : undefined}>
          <legend>¿Lo cambias o lo regalas? *</legend>
          <div className="opciones">
            {MODALIDADES.map((m) => (
              <label key={m} className="opcion">
                <input type="radio" value={m} aria-invalid={errors.modalidad ? true : false} {...register("modalidad")} />
                {ETIQUETAS.modalidad[m]}
              </label>
            ))}
          </div>
          <MensajeError nombre="modalidad" error={errors.modalidad} />
        </fieldset>

        {/* ── A cambio: solo aparece si es un intercambio ──────── */}
        {modalidad === "intercambio" && (
          <div className="campo">
            <label htmlFor="buscaACambio">¿Qué te gustaría a cambio? *</label>
            <input
              id="buscaACambio"
              type="text"
              placeholder="Un esqueje de monstera, semillas de tomate…"
              {...ariaCampo("buscaACambio", errors.buscaACambio)}
              {...register("buscaACambio")}
            />
            <MensajeError nombre="buscaACambio" error={errors.buscaACambio} />
          </div>
        )}

        <div className="fila">
          {/* ── Ciudad (select rellenado con useQuery) ───────── */}
          <div className="campo">
            <label htmlFor="ciudadId">Ciudad *</label>
            <select
              id="ciudadId"
              disabled={!ciudades.isSuccess}
              {...ariaCampo("ciudadId", errors.ciudadId)}
              {...register("ciudadId")}
            >
              <option value="">{ciudades.isPending ? "Cargando ciudades…" : "Elige…"}</option>
              {ciudades.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.provincia})
                </option>
              ))}
            </select>
            {ciudades.isError && (
              <p role="alert" className="error">
                No se han podido cargar las ciudades.{" "}
                <button type="button" className="enlace" onClick={() => ciudades.refetch()}>
                  Reintentar
                </button>
              </p>
            )}
            <MensajeError nombre="ciudadId" error={errors.ciudadId} />
          </div>

          {/* ── Fecha ──────────────────────────────────────── */}
          <div className="campo">
            <label htmlFor="disponibleDesde">Disponible desde *</label>
            <input
              id="disponibleDesde"
              type="date"
              min={hoyISO()}
              {...ariaCampo("disponibleDesde", errors.disponibleDesde)}
              {...register("disponibleDesde")}
            />
            <MensajeError nombre="disponibleDesde" error={errors.disponibleDesde} />
          </div>
        </div>

        {/* ── Contacto (email) ───────────────────────────────── */}
        <div className="campo">
          <label htmlFor="contacto">Email de contacto *</label>
          <input
            id="contacto"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            {...ariaCampo("contacto", errors.contacto)}
            {...register("contacto")}
          />
          <MensajeError nombre="contacto" error={errors.contacto} />
        </div>

        {/* ── Descripción (textarea con contador) ────────────── */}
        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            rows={3}
            placeholder="¿Tiene raíces? ¿En agua o en tierra? ¿Maceta incluida?"
            {...ariaCampo("descripcion", errors.descripcion, { conAyuda: true })}
            {...register("descripcion")}
          />
          <p
            id="descripcion-ayuda"
            className={descripcion.length > MAX_DESCRIPCION ? "ayuda contador-excedido" : "ayuda"}
          >
            {descripcion.length}/{MAX_DESCRIPCION} caracteres
          </p>
          <MensajeError nombre="descripcion" error={errors.descripcion} />
        </div>

        {/* ── Mascotas (checkbox) ─────────────────────────────── */}
        <div className="campo">
          <label className="opcion">
            <input type="checkbox" {...ariaCampo("aptaMascotas", errors.aptaMascotas)} {...register("aptaMascotas")} />
            Es segura para perros y gatos
          </label>
          <MensajeError nombre="aptaMascotas" error={errors.aptaMascotas} />
        </div>

        {/* ── Envío y respuesta del servidor ─────────────────── */}
        {crear.isError && (
          <p role="alert" className="aviso aviso-error">
            No se ha podido publicar: {crear.error.message}
          </p>
        )}
        {crear.isSuccess && (
          <p role="status" className="aviso aviso-exito">
            ✅ «{crear.data.especie}» publicado. Ya aparece en el tablón.
          </p>
        )}

        <div className="acciones">
          {/* Desactivado mientras viaja el POST: evita anuncios duplicados por doble clic. */}
          <button type="submit" disabled={crear.isPending}>
            {crear.isPending ? "Publicando…" : "Publicar"}
          </button>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => {
              reset();
              crear.reset(); // borra también el mensaje de éxito o de error
            }}
          >
            Vaciar
          </button>
        </div>
      </form>
    </section>
  );
}
