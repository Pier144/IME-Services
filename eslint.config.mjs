import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Configurazione ESLint "flat" (eslint-config-next 16 la esporta già così,
 * senza bisogno del ponte FlatCompat).
 */
const eslintConfig = [
  {
    // `design/` contiene i prototipi HTML dell'handoff con il loro runtime:
    // sono riferimenti di disegno, non codice di produzione, e analizzarli
    // segnalerebbe problemi veri su codice che non spediamo.
    // `Ricreazione pagina admin/` è la cartella di consegna, gli stessi file
    // di `design/handoff-admin/`: si può cancellare.
    ignores: [
      '.next/**',
      'node_modules/**',
      'design/**',
      'storage/**',
      'Ricreazione pagina admin/**',
    ],
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
