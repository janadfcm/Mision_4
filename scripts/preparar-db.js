// json-server ESCRIBE en el fichero que sirve: cada POST o DELETE lo cambia.
// Para no ensuciar el repositorio, db.json es la semilla (no se toca) y el
// servidor trabaja sobre una copia, db.runtime.json, que está en .gitignore.
//   node scripts/preparar-db.js          → crea la copia solo si no existe
//   node scripts/preparar-db.js --reset  → la vuelve a copiar (datos iniciales)
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const semilla = "db.json";
const copia = "db.runtime.json";
const reset = process.argv.includes("--reset");

if (reset || !existsSync(copia)) {
  // Se reescribe el contenido (no copyFileSync): así json-server, que vigila
  // el fichero, se entera del cambio y recarga sin reiniciarlo.
  writeFileSync(copia, readFileSync(semilla));
  console.log(`Copiado ${semilla} → ${copia}`);
}
