import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Test, per ora, solo dei convertitori del corpo articolo.
 *
 * Il resto del progetto si verifica con `typecheck`, `lint`, `build` e a mano
 * nel browser. I convertitori fra blocchi e documento dell'editor sono l'unico
 * punto in cui un errore corrompe gli articoli in silenzio, senza che niente
 * si rompa a vista: lì un test vale piu' di una riletura.
 *
 * Ambiente `node` e non `jsdom`: sono funzioni pure su strutture dati, non
 * componenti da montare.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
