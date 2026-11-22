# Esquejario 🌿

## Descripción

Tablón para **intercambiar y regalar esquejes, plantas y semillas** con gente de tu ciudad. Hecho con **React 19 + Vite**, **React Hook Form**, **Zod 4** y **TanStack Query v5**, sobre una API simulada con **json-server**.

Qué se puede hacer:
- **Publicar un anuncio** con un formulario de 11 campos de tipos distintos: texto, radios, selects, número, fecha, email, textarea con contador y checkbox. El select de ciudades se rellena desde el API con `useQuery`.
- **Ver el tablón**, filtrarlo por ciudad y **retirar** anuncios.
- Estados claros en todo momento: cargando, actualizando, error con «Reintentar», lista vacía y mensaje de éxito al publicar.

Reglas de validación (todas en `src/schemas/esqueje.js`, con mensajes propios):
- Riego entre 1 y 60 días, entero (`z.coerce.number()`, porque el input da texto).
- Fecha «disponible desde» entre hoy y dentro de 3 meses (`z.iso.date()` + dos `.refine`).
- **Reglas entre campos** (`superRefine`):
  - si es un **intercambio**, hay que decir qué se busca a cambio;
  - si la especie es **tóxica para mascotas** (pothos, monstera, aloe…), no se puede marcar como «segura para perros y gatos». Además, el formulario avisa en cuanto se escribe la especie.

### Bonus: validar la respuesta del API
Lo que llega de json-server también pasa por Zod (`esquemaEsqueje.safeParse`) antes de pintarse. `db.json` trae **un registro corrupto a propósito** (id `99`: `riegoDias: "cuando me acuerdo"`, `tipo: "arbusto"`, sin email…). La app **no lo pinta**: lo aparta y muestra un aviso «Zod ha descartado 1 anuncio» con la lista de campos que fallan. Si se borra ese registro de `db.json` y se ejecuta `npm run api:reset`, el aviso desaparece.

### Estructura

```
db.json                       semilla de la API: ciudades + esquejes (con 1 corrupto)
scripts/preparar-db.js        copia db.json → db.runtime.json (el que modifica json-server)
src/
├── main.jsx                  QueryClientProvider (un único QueryClient) + Zod en castellano
├── App.jsx                   formulario + tablón
├── schemas/esqueje.js        ÚNICA fuente de verdad: esquema del formulario y de la respuesta
├── api/
│   ├── cliente.js            fetch, response.ok y mensajes de error
│   ├── esquejes.js           GET (con safeParse por registro), POST y DELETE
│   └── ciudades.js           GET de ciudades validado
├── hooks/
│   ├── claves.js             claves de TanStack Query en un solo sitio
│   ├── useCiudades.js        useQuery (staleTime: Infinity)
│   └── useEsquejes.js        useQuery por ciudad + useMutation de crear y retirar (con invalidación)
├── components/
│   ├── FormularioEsqueje.jsx RHF + zodResolver, accesible
│   ├── MensajeError.jsx      mensaje con id para aria-describedby y role="alert"
│   ├── Tablon.jsx            filtro, estados y lista
│   ├── TarjetaEsqueje.jsx    un anuncio
│   └── AvisoDescartados.jsx  bonus: registros rechazados por Zod
└── lib/
    ├── aria.js               aria-invalid y aria-describedby de cada campo
    └── formato.js            etiquetas y fechas para mostrar
```

## Cómo ejecutarlo

Requisitos: Node 22 LTS (o superior).

```bash
npm install
npm run api      # terminal 1: API en http://localhost:3000 (json-server)
npm run dev      # terminal 2: app en http://localhost:5173
```

- `npm run api:reset`: devuelve los datos a los de `db.json` (json-server recarga solo).
- `npm run lint`: revisa el código con oxlint.
- `npm run build`: versión de producción en `dist/`.

json-server **escribe** en el fichero que sirve. Por eso `db.json` es solo la semilla y el servidor trabaja sobre `db.runtime.json`, que está en `.gitignore`: así publicar o retirar anuncios no ensucia el repositorio.

## Decisiones técnicas

- **Sin reglas en `register`**: los inputs solo llevan `{...register("campo")}`. Todas las reglas y mensajes están en el esquema de Zod, conectado con `zodResolver`.
- **`mode: "onTouched"`**: no salen errores hasta que el usuario sale de un campo. Desde ese momento se revalida mientras escribe.
- **Accesibilidad**:
  - `<label htmlFor>` en todos los campos y `fieldset` + `legend` en los radios;
  - `noValidate` en el formulario, para que los errores los ponga Zod y no el navegador;
  - `aria-invalid`, y `aria-describedby` apuntando al mensaje de error (y a la ayuda cuando la hay);
  - `role="alert"` en los errores y `role="status"` en el éxito;
  - foco al primer campo con error (lo hace RHF);
  - el borde rojo sale del propio `[aria-invalid="true"]`, que es lo mismo que lee el lector de pantalla.
- **Claves de TanStack Query jerárquicas** (`hooks/claves.js`): `["esquejes", { ciudadId }]`. Al crear o retirar se invalida `["esquejes"]`, que es el prefijo de todas, así que se refrescan la lista general y las de cada ciudad.
- **`placeholderData: keepPreviousData`** en la lista: al cambiar de ciudad se sigue viendo la lista anterior («Actualizando…») en vez de un parpadeo de «Cargando…».
- **Doble envío**: el botón se desactiva con `isPending` mientras viaja el POST. Tras el éxito, `reset()` vacía el formulario.
- **Ids de ciudad como texto** (`"madrid"`, no `"1"`): json-server v1 convierte `?ciudadId=1` en el número 1 y deja de coincidir con el `"1"` guardado, así que el filtro devolvía `[]`. Con ids que no son números no los convierte.

## Uso de IA

**Herramienta:** Claude Code (en la terminal, sobre el repositorio).

**Qué delegué:** la IA escribió el código de la misión (esquemas, servicios, hooks, componentes y CSS) y este README. Yo elegí el dominio (intercambio de plantas, entre varias propuestas que descarté), dónde crear el proyecto y cómo repartir los *commits*. Después repasé el código con la IA fichero a fichero para poder defenderlo.

**Prompts reales:**
- «vale vamos a hacer la mision 4 quiero que la hagas tu y luego me vayas explicando el codigo poco a poco, acuerdate de hacer 5 commits»
- Rechacé los primeros dominios que me propuso (rocódromo, adopción de mascotas, e-sports) y pedí otros; de la segunda tanda elegí el intercambio de plantas.

**Cómo lo verificé:**
- `npm run lint` sin avisos y `npm run build` sin errores. El linter cazó que `MensajeError.jsx` exportaba un componente y una función a la vez (rompe el *fast refresh*), y la función se movió a `lib/aria.js`.
- Esquemas probados en Node con datos buenos y malos antes de montar el formulario: así salió que, con la fecha vacía, aparecían dos errores a la vez. Se arregló con `abort: true`.
- Con `curl` contra json-server, que es como se descubrió el problema de los ids numéricos en el filtro.
- En Chrome:
  - enviar vacío (6 errores y foco en «Especie»);
  - las dos reglas entre campos;
  - publicar un anuncio (aparece arriba del tablón y el formulario se vacía);
  - filtrar por ciudad, incluida una ciudad sin anuncios;
  - retirar un anuncio;
  - simular la caída del servidor (sale el error y «Reintentar» funciona);
  - comprobar que el registro corrupto se descarta con sus 5 motivos.

## Autopsia

1. **El registro corrupto se descarta solo, no tumba toda la lista.** Cada registro pasa su propio `safeParse`: los buenos se pintan y los malos se listan en un aviso. *Alternativa descartada:* `z.array(esquemaEsqueje).safeParse(json)` y lanzar un error si falla, que es lo más simple. Pero así un único dato roto deja el tablón entero en estado de error, y con el registro 99 en `db.json` la app no mostraría nunca nada. Lo discutible: un dato malo se queda «escondido» en un aviso en vez de parar la app. Por eso las ciudades sí lanzan error si llegan mal: sin ellas el formulario no sirve.
2. **Dos esquemas distintos para el formulario y para la respuesta**, aunque se parecen mucho. *Alternativa descartada:* reutilizar el del formulario con `.extend({ id, publicadoEn })`. No sirve, porque el del formulario rechaza fechas pasadas: un anuncio publicado la semana pasada es un dato válido en la lista, aunque ya no se pueda crear así. Lo que sí comparten son las opciones (`TIPOS`, `LUCES`, `MODALIDADES`), para que no se desincronicen. El precio es que, si se añade un campo nuevo, hay que tocar los dos esquemas.
