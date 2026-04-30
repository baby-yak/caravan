import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'no-empty-pattern': 'off', // allow empty destructuring patterns
      '@typescript-eslint/no-restricted-types': 'off', // allow use of the `{}` type and other types
      '@typescript-eslint/no-unused-vars': 'warn', // warn instead of error for unused variables
      '@typescript-eslint/no-empty-object-type': 'off', // allow {} type
      '@typescript-eslint/no-explicit-any': 'off', // allow explicit any type
    },
  },
]);
