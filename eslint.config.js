import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /* `.smoke` holds the bundle `npm run smoke` builds, not authored source. */
  globalIgnores(['dist', '.smoke']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    /* Build-time tooling runs in Node, not the browser. */
    files: ['scripts/**/*.{js,jsx}', '*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
