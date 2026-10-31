/*
|| श्री गणेशाय नमः - SHRI GANESHAY NAMAH ||
|| सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके शरण्ये त्र्यंबके गौरी नारायणी नमोऽस्तुते - SARV MANGAL MANGALYAII SHIVE SARVATH SADHIKE SHARANYE TRYAMBAKE GOURI NARYAYANI NAMOSTUTE ||
|| श्री बालाजी देवाय नमः - SHRI BALAJI DEVAY NAMAH ||
|| श्री दत्तात्रेयाय नमः - SHRI DATTATREYAY NAMAH ||
|| श्री नवनाथाय नमः - SHRI NAVNATHAY NAMAH ||
|| जय श्री राम - JAY SHREE RAM ||
|| जय हनुमान - JAY HANUMAN ||
*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { existsSync } from "node:fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "3000";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  define: {
    global: "globalThis",
  },
  plugins: [
    {
      name: "tool-route-entry-points",
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          const pathname = (req.url ?? "").split("?")[0];
          if (/^\/(?:tools\/|category\/)?[a-z0-9-]+\/?$/.test(pathname)) {
            const relative = pathname.replace(/^\//, "").replace(/\/$/, "") + "/index.html";
            if (existsSync(path.resolve(import.meta.dirname, "dist/public", relative))) req.url = "/" + relative;
          }
          next();
        });
      },
    },
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    proxy: { "/api": { target: process.env.API_PROXY_TARGET ?? "http://127.0.0.1:5000", changeOrigin: true } },
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
