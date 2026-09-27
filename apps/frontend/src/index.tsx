import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeModeProvider } from "./context/ThemeContext";
import "./index.css";
import { enforceActiveStatusFilterByDefault } from "./utils/tablePreferences";

// Corre una sola vez por navegador: deja los listados de Personal y Roles en
// "Activos" aunque tuviera "Todos" guardado de antes.
enforceActiveStatusFilterByDefault();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  // <React.StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  // </React.StrictMode>,
);
