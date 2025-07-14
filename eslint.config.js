import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/dist/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      indent: ["error", 2], // aqui define 2 espaços
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node,
      } 
    },
  },
]);
