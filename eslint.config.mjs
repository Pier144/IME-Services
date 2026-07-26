import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Configurazione ESLint "flat" (eslint-config-next 16 la esporta già così,
 * senza bisogno del ponte FlatCompat).
 */
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'design/**', 'storage/**'],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default eslintConfig;
