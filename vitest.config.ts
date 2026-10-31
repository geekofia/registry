import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The items' tests; the docs are Astro's (astro.config.ts).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/components": at("./registry/components"),
      "@/hooks": at("./registry/hooks"),
      "@/lib": at("./registry/lib"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["registry/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});
