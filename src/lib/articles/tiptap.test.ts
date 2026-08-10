import { describe, expect, it } from 'vitest';
import type { BodyBlock } from './body';
import { blocksToDoc, docToBlocks } from './tiptap';

/**
 * La promessa da mantenere: aprire un articolo nell'editor e risalvarlo senza
 * toccarlo deve lasciare il corpo identico. Se questi test passano, nessun
 * articolo si corrompe attraversando l'editor.
 *
 * Il giro è blocchi → documento → blocchi, perché è esattamente quello che
 * succede a ogni apertura e salvataggio.
 */

const casi: Array<[string, BodyBlock[]]> = [
  ['apertura semplice', [{ type: 'lead', text: 'Tre settimane di lavoro e 42 sospensioni.' }]],
  [
    'grassetto e corsivo',
    [{ type: 'lead', text: 'Apertura con **grassetto** e *corsivo* insieme.' }],
  ],
  ['sottolineato', [{ type: 'paragraph', text: 'Un tratto __sottolineato__ nel mezzo.' }]],
  [
    'collegamento',
    [{ type: 'paragraph', text: 'Scritto su [ime-service.it](https://ime-service.it) ieri.' }],
  ],
  ['titolo di sezione', [{ type: 'heading', text: 'Come si è lavorato' }]],
  ['citazione senza attribuzione', [{ type: 'quote', text: 'Tre notti di posa.' }]],
  [
    'citazione con attribuzione',
    [{ type: 'quote', text: 'Tre notti di posa.', attribution: 'Il caposquadra' }],
  ],
  ['elenco', [{ type: 'list', items: ['Attraversamenti', 'Portali', 'Albero da dodici metri'] }]],
  [
    'immagine completa',
    [{ type: 'image', label: 'FOTO', caption: 'Piazza Bra di notte', src: '/foto/bra.jpg' }],
  ],
  ['immagine senza sorgente', [{ type: 'image', label: 'FOTO: da definire', src: null }]],
  [
    'articolo intero',
    [
      { type: 'lead', text: 'Attraversamenti, portali e un **albero da dodici metri**.' },
      { type: 'heading', text: 'Come si è lavorato' },
      { type: 'paragraph', text: 'Tre notti di posa, con il centro chiuso al traffico.' },
      { type: 'list', items: ['Due squadre in cestello', 'Quadri protetti'] },
      { type: 'quote', text: 'Non si lavora con il vento.', attribution: 'Il caposquadra' },
      { type: 'image', label: 'FOTO', caption: 'Il portale acceso', src: '/foto/portale.jpg' },
      { type: 'paragraph', text: 'Chiusura con un [link](https://ime-service.it).' },
    ],
  ],
];

describe('blocchi → documento dell editor → blocchi', () => {
  it.each(casi)('non perde niente: %s', (_nome, blocchi) => {
    expect(docToBlocks(blocksToDoc(blocchi))).toEqual(blocchi);
  });

  /**
   * `toEqual` non guarda l'ordine delle chiavi, ma la colonna `body` salva
   * JSON.stringify: se l'ordine cambia, la stringa cambia e ogni apertura
   * riscrive l'articolo senza che nessuno lo abbia modificato. Questo caso
   * l'ha già colto una volta, su un'immagine con didascalia.
   */
  it.each(casi)('nemmeno un byte: %s', (_nome, blocchi) => {
    expect(JSON.stringify(docToBlocks(blocksToDoc(blocchi)))).toBe(JSON.stringify(blocchi));
  });
});

describe('robustezza', () => {
  it('un corpo vuoto resta vuoto', () => {
    expect(docToBlocks(blocksToDoc([]))).toEqual([]);
  });

  it('un documento senza contenuto non esplode', () => {
    expect(docToBlocks({ type: 'doc', content: [] })).toEqual([]);
  });

  it('scarta i nodi che il modello dati non sa contenere', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'codeBlock', content: [{ type: 'text', text: 'rm -rf /' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Questo resta.' }] },
      ],
    };
    // Paragrafo, non apertura: l'apertura è marcata esplicitamente con
    // `attrs.lead`, non dedotta dall'essere il primo blocco.
    expect(docToBlocks(doc)).toEqual([{ type: 'paragraph', text: 'Questo resta.' }]);
  });

  it('un documento che non e un documento non esplode', () => {
    expect(docToBlocks(null)).toEqual([]);
    expect(docToBlocks({ type: 'doc' })).toEqual([]);
    expect(docToBlocks('&lt;script&gt;')).toEqual([]);
  });
});
