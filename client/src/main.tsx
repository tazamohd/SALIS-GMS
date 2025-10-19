import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/config";
import { registerServiceWorker, setupPWAInstallPrompt } from "./lib/registerSW";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA and offline support
if (import.meta.env.PROD) {
  registerServiceWorker();
  setupPWAInstallPrompt();
}
