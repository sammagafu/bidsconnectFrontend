const vuePlugin = require('eslint-plugin-vue');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const parser = require('@typescript-eslint/parser');
const vueParser = require('vue-eslint-parser');

module.exports = [
  {
    ignores: ['dist/**', 'dist-ssr/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,vue,mjs,cjs}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        Node: 'readonly',
        navigator: 'readonly',
        MutationObserver: 'readonly',
        FileReader: 'readonly',
        File: 'readonly',
        WebSocket: 'readonly',
      },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'vue/html-self-closing': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
    },
  },
];
