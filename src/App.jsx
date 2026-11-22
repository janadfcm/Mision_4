import FormularioEsqueje from "./components/FormularioEsqueje.jsx";
import Tablon from "./components/Tablon.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="cabecera">
        <h1>🌿 Esquejario</h1>
        <p>Intercambia y regala esquejes, plantas y semillas con gente de tu ciudad.</p>
      </header>
      <main className="contenido">
        <FormularioEsqueje />
        <Tablon />
      </main>
    </div>
  );
}
