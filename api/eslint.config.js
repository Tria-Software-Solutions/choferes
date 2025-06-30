import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';
import airbnbBase from 'eslint-config-airbnb-base';
import airbnbTypeScriptBase from 'eslint-config-airbnb-typescript/base';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  airbnbBase,
  airbnbTypeScriptBase({
    tsconfigPath: './tsconfig.json',
  }),
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'warn',
    },
  },
]; 