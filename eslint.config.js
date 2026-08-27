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
  {
    /* src/ may never import from api/ — CLAUDE.md. They run in different
       environments (browser vs. Node) and deploy separately; an import across
       that boundary either crashes the client build or, worse, bundles
       server-only code (and whatever secret it reads) into the pages a
       visitor downloads. Every import from api/ reaches it as a relative path
       that climbs out of src/, so a path pattern is sufficient — no
       eslint-plugin-import needed for this one rule. */
    files: ['src/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/api/*', '**/api'],
              message:
                'src/ may never import from api/ — secrets in api/ would end up in the client bundle. See api/README.md.',
            },
          ],
        },
      ],
    },
  },
])
