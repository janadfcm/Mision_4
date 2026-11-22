import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

// Un único QueryClient para toda la app: guarda la caché de las queries.
// Se crea FUERA de los componentes para que no se rehaga en cada render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 }, // un reintento y, si falla otra vez, error en pantalla
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
