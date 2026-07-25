import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./store/StoreContext";
import { applyTheme } from "./lib/useTheme";
import "./index.css";

// Set the theme before React mounts, so there's no flash of the wrong palette.
try {
  const saved = localStorage.getItem("studyquest.theme");
  applyTheme(saved === "light" || saved === "dark" || saved === "system" ? saved : "dark");
} catch {
  applyTheme("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
