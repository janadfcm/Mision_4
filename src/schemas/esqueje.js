import { z } from "zod";

// Opciones cerradas. Las usan los esquemas Y los componentes (radios y
// select), así que si se añade una opción, se añade solo aquí.
export const TIPOS = ["esqueje", "planta", "semillas"];
export const LUCES = ["sombra", "indirecta", "directa"];
export const MODALIDADES = ["intercambio", "regalo"];

// Plantas tóxicas para perros y gatos (lista corta, orientativa).
const TOXICAS = ["pothos", "potus", "monstera", "dieffenbachia", "aloe", "sansevieria", "lirio", "ficus", "hiedra", "cica"];

// "Pothos Dorado" → "pothos dorado"; "Áloe" → "aloe". Así la comparación
// no depende de mayúsculas ni tildes.
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function esToxica(especie) {
  const nombre = normalizar(especie);
  return TOXICAS.some((toxica) => nombre.includes(toxica));
}

// Fecha de hoy como "AAAA-MM-DD" en hora LOCAL. toISOString() da la hora
// UTC; restando el desfase horario evitamos que a las 00:30 en España
// todavía "sea ayer".
export function hoyISO() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 10);
}

function sumarDias(fechaISO, dias) {
  const fecha = new Date(`${fechaISO}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────
// 1) ESQUEMA DEL FORMULARIO: lo que el usuario puede enviar.
//    Es la única fuente de verdad de la validación: los inputs no llevan
//    reglas, solo {...register("campo")}.
// ─────────────────────────────────────────────────────────────────────
export const esquemaFormulario = z
  .object({
    // .trim() quita espacios antes de validar: "   " no cuenta como nombre.
    especie: z
      .string()
      .trim()
      .min(2, "Escribe la especie (mínimo 2 letras)")
      .max(60, "Máximo 60 caracteres"),

    // Un grupo de radios sin marcar da null: z.enum falla y sale el mensaje.
    tipo: z.enum(TIPOS, { error: "Elige qué ofreces" }),

    // El select empieza en "" (opción «Elige…»), que no está en LUCES.
    luz: z.enum(LUCES, { error: "Elige cuánta luz necesita" }),

    // El input da texto ("7"); z.coerce.number() lo pasa a número (7)
    // antes de validar. Vacío ("") se convierte en 0 → mensaje del .min(1).
    riegoDias: z.coerce
      .number({ error: "Escribe un número de días" })
      .int("Tiene que ser un número entero de días")
      .min(1, "Indica cada cuántos días se riega (mínimo 1)")
      .max(60, "Más de 60 días sin agua: ¿seguro que es una planta?"),

    modalidad: z.enum(MODALIDADES, { error: "Elige si lo cambias o lo regalas" }),

    // Opcional aquí: si es obligatorio o no depende de "modalidad",
    // y eso lo decide el superRefine de abajo, que ve todo el objeto.
    buscaACambio: z.string().trim().max(80, "Máximo 80 caracteres"),

    ciudadId: z.string().min(1, "Elige tu ciudad"),

    // z.iso.date() exige el formato "AAAA-MM-DD" (lo que da <input type="date">).
    // Las fechas en ese formato se pueden comparar como texto: "2026-11-22" < "2026-12-01".
    disponibleDesde: z.iso
      .date({ error: "Elige una fecha", abort: true }) // abort: si falta la fecha, no seguir con los .refine
      .refine((fecha) => fecha >= hoyISO(), { error: "La fecha no puede ser anterior a hoy" })
      .refine((fecha) => fecha <= sumarDias(hoyISO(), 90), {
        error: "Como mucho, dentro de 3 meses",
      }),

    contacto: z.email("Escribe un email válido, p. ej. nombre@correo.com"),

    descripcion: z.string().trim().max(300, "Máximo 300 caracteres"),

    // Un checkbox registrado da true o false.
    aptaMascotas: z.boolean(),
  })
  // superRefine ve el objeto entero y puede añadir VARIOS errores, cada uno
  // en su campo (path). .refine solo permite uno.
  .superRefine((datos, ctx) => {
    if (datos.modalidad === "intercambio" && datos.buscaACambio === "") {
      ctx.addIssue({
        code: "custom",
        message: "Si es un intercambio, di qué te gustaría a cambio",
        path: ["buscaACambio"],
      });
    }
    if (datos.aptaMascotas && esToxica(datos.especie)) {
      ctx.addIssue({
        code: "custom",
        message: `«${datos.especie}» es tóxica para perros y gatos: desmarca esta casilla`,
        path: ["aptaMascotas"],
      });
    }
  });

// ─────────────────────────────────────────────────────────────────────
// 2) ESQUEMAS DE LA RESPUESTA DEL API (bonus): lo que esperamos recibir.
//    No reutilizan el del formulario a propósito: un anuncio antiguo con
//    fecha pasada es un dato VÁLIDO en la lista, aunque ya no se pueda
//    crear así desde el formulario.
// ─────────────────────────────────────────────────────────────────────
export const esquemaEsqueje = z.object({
  id: z.string(), // json-server v1 guarda los id como texto ("1", "TTg_0-Rl86k")
  especie: z.string().min(1),
  tipo: z.enum(TIPOS),
  luz: z.enum(LUCES),
  riegoDias: z.number().int().positive(),
  modalidad: z.enum(MODALIDADES),
  buscaACambio: z.string().optional(),
  ciudadId: z.string(),
  disponibleDesde: z.iso.date(),
  contacto: z.email(),
  descripcion: z.string().optional(),
  aptaMascotas: z.boolean(),
  publicadoEn: z.iso.datetime(),
});

export const esquemaCiudades = z.array(
  z.object({
    id: z.string(),
    nombre: z.string(),
    provincia: z.string(),
  }),
);
