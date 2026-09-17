import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Tidak strict untuk variable yang tidak digunakan
      "@typescript-eslint/no-unused-vars": "off",

      // Opsional: matikan aturan JS bawaan
      "no-unused-vars": "off",

      // React Hooks tetap diperiksa
      ...reactHooks.configs.recommended.rules,

      // Tidak terlalu strict untuk React Refresh
      "react-refresh/only-export-components": "warn",
    },
  },
]);
