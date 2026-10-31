import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The docs site, served from GitHub Pages at /registry/; the items' JSON sits
// beside it in /registry/r/.
export default defineConfig(({ command }) => ({
  root: "site",
  base: command === "build" ? "/registry/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@/components": at("./registry/components"),
      "@/hooks": at("./registry/hooks"),
      "@/lib": at("./registry/lib"),
      "@registry": at("./registry"),
    },
  },
  server: { fs: { allow: [at(".")] } },
  build: { outDir: at("./dist"), emptyOutDir: true },
  test: {
    root: at("."),
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["registry/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
}));
