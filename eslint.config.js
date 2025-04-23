import eslint from '@eslint/js';
import * as tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  eslint.configs.recommended,
  {
    ignores: ['**/.next/**/*']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        // Node.js globals
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        // React globals
        React: 'readonly',
        JSX: 'readonly',
        useState: 'readonly',
        useEffect: 'readonly',
        // Project-specific globals
        toast: 'readonly',
        supabase: 'readonly',
        confirm: 'readonly',
        motion: 'readonly',
        ReactDiffViewer: 'readonly',
        Content: 'readonly',
        ContentVersion: 'readonly',
        contentId: 'readonly',
        // Vitest globals
        global: 'readonly',
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
          moduleDirectory: ['node_modules', 'src']
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-duplicate-imports': 'off',
      'import/no-duplicates': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'import/no-unresolved': [
        'error',
        { ignore: ['^geist/'] }
      ],
      'react/prop-types': 'off',
      '@next/next/no-img-element': 'off',
      'import/named': 'error',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-named-as-default-member': 'error',
      'react/no-unknown-property': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-redeclare': 'off',
      'no-useless-escape': 'off'
    }
  }
];