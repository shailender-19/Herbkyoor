import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Offline/file:// builds have no server to rewrite deep links, so routing must
// live in the URL hash. Served builds keep clean History-API URLs.
const Router =
  import.meta.env.VITE_OFFLINE === "true" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
