import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * I test coprono la logica pura: serializzazione del corpo, validazione del
 * payload, regole da tastiera dell'editor. Niente browser, niente database:
 * sono le cose che si rompono in silenzio e che a mano si provano male.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    // Lo stesso alias di tsconfig.json: i test importano come il resto del codice.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
