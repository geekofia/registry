import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "site/public/r"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      // Must stay last: turns off rules that would fight Prettier.
      eslintConfigPrettier,
    ],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["registry/public/**/*.js"],
    extends: [js.configs.recommended, eslintConfigPrettier],
    languageOptions: { globals: globals.browser, sourceType: "script" },
  },
  {
    files: ["scripts/**/*.ts", "*.config.ts"],
    languageOptions: { globals: globals.node },
  },
]);
