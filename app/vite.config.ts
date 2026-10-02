/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { repoPlugin } from "./serwer-repo.ts";

/** Katalog główny repo kursu — strona czyta z niego pliki w czasie działania. */
const KORZEN_REPO = fileURLToPath(new URL("..", import.meta.url));

// Porty 3000 i 3100 zajmuje Kurs-Yale.
const PORT = 3200;
// Codespaces (`*.app.github.dev`) i nazwy w sieci domowej (`komputer.local`). Adresy IP są dozwolone zawsze.
const HOSTY = [".app.github.dev", ".local"];

export default defineConfig({
  plugins: [react(), tailwindcss(), repoPlugin(KORZEN_REPO)],
  server: { port: PORT, strictPort: true, allowedHosts: HOSTY },
  preview: { port: PORT, strictPort: true, allowedHosts: HOSTY },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
