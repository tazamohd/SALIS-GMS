import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// The Replit overlay plugins (runtime-error-modal, cartographer) only work
// when running inside Replit (they fetch source-maps via a Replit-specific
// HTTP API). On non-Replit dev hosts they spam "Failed to parse JSON file"
// in the Vite log because the source-map endpoint doesn't exist. Gate both
// plugins behind REPL_ID like cartographer already was.
const isReplit = process.env.REPL_ID !== undefined;
const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [
    react(),
    ...(isReplit
      ? await Promise.all([
          import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
          ...(!isProd
            ? [import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())]
            : []),
        ])
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-popover'],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
