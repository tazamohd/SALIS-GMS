import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import "./i18n/config";
import { registerServiceWorker, setupPWAInstallPrompt } from "./lib/registerSW";

// Client error tracking — no-op unless VITE_SENTRY_DSN is configured.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register service worker for PWA and offline support
if (import.meta.env.PROD) {
  registerServiceWorker();
  setupPWAInstallPrompt();
}
