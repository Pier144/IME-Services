import { describe, expect, it } from 'vitest';
import {
  blocksToText,
  normalizeBody,
  parseBody,
  serializeBody,
  textToBlocks,
  type BodyBlock,
} from './body';

/**
 * Il corpo dell'articolo è JSON in una colonna TEXT: quello che conta non è
 * che i dati siano uguali, è che la *stringa* sia uguale. `toEqual` non se ne
 * accorgerebbe, quindi qui si confronta sempre il serializzato.
 *
 * Se questi test cadono, il sintomo in produzione è subdolo: gli articoli si
 * riscrivono da soli a ogni apertura, `updatedAt` si sporca e le pagine
 * pubbliche si rigenerano senza che nessuno abbia cambiato niente.
 */

/** Un giro completo: dal database all'editor e ritorno nel database. */
function roundTrip(stored: string): string {
  return serializeBody(normalizeBody(parseBody(stored)));
}

describe('normalizeBody', () => {
  it('è idempotente', () => {
    const blocks = [
      { type: 'paragraph', text: 'Primo' },
      { type: 'heading', text: 'Una sezione' },
      { type: 'paragraph', text: 'Secondo' },
      { type: 'list', items: ['uno', 'due'] },
      { type: 'quote', text: 'Detta così', attribution: 'La squadra' },
      { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: null },
    ];

    const once = normalizeBody(blocks);
    expect(serializeBody(normalizeBody(once))).toBe(serializeBody(once));
  });

  it('fa del primo blocco di testo un lead, e di ogni lead successivo un paragrafo', () => {
    const blocks = normalizeBody([
      { type: 'heading', text: 'Prima del testo' },
      { type: 'paragraph', text: 'Il primo testo' },
      { type: 'lead', text: 'Un secondo lead' },
      { type: 'paragraph', text: 'Il terzo' },
    ]);

    expect(blocks.map((block) => block.type)).toEqual(['heading', 'lead', 'paragraph', 'paragraph']);
  });

  it('scarta i blocchi che non si sanno leggere', () => {
    const blocks = normalizeBody([
      { type: 'paragraph', text: 'Buono' },
      { type: 'sconosciuto', text: 'Boh' },
      { type: 'heading' },
      null,
      'una stringa',
      { type: 'list', items: ['uno', 42, 'due'] },
    ]);

    expect(blocks).toEqual([
      { type: 'lead', text: 'Buono' },
      { type: 'list', items: ['uno', 'due'] },
    ]);
  });
});

describe('stabilità della serializzazione', () => {
  it('non riscrive un corpo già normalizzato', () => {
    const primo = serializeBody(
      normalizeBody([
        { type: 'paragraph', text: 'Apertura' },
        { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: null },
        { type: 'quote', text: 'Detta così', attribution: 'La squadra' },
      ]),
    );

    expect(roundTrip(primo)).toBe(primo);
    expect(roundTrip(roundTrip(primo))).toBe(primo);
  });

  it('fa convergere in una scrittura sola i tre ordini di chiavi del blocco foto', () => {
    // Le tre forme che il progetto ha prodotto finora: il seed, il vecchio
    // salvataggio via textToBlocks, e la rilettura via parseBlock.
    const seed = JSON.stringify([{ type: 'image', label: 'FOTO: piazza', caption: 'Novembre' }]);
    const daTextToBlocks = JSON.stringify([
      { type: 'image', label: 'FOTO: piazza', src: null, caption: 'Novembre' },
    ]);
    const daParseBlock = JSON.stringify([
      { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: null },
    ]);

    expect(seed).not.toBe(daTextToBlocks);

    const atteso = roundTrip(daParseBlock);
    expect(roundTrip(seed)).toBe(atteso);
    expect(roundTrip(daTextToBlocks)).toBe(atteso);

    // E da lì in poi non si muove più.
    expect(roundTrip(atteso)).toBe(atteso);
  });

  it('regge il giro completo su un corpo del seed', () => {
    const seed: BodyBlock[] = [
      { type: 'paragraph', text: 'Il primo sopralluogo è di settembre.' },
      { type: 'paragraph', text: 'Il montaggio comincia il 18 novembre.' },
      { type: 'quote', text: 'Una piazza illuminata bene non si nota.', attribution: 'IME Service' },
      { type: 'image', label: 'FOTO: montaggio notturno', caption: 'Novembre 2025.' },
      { type: 'paragraph', text: 'L’accensione ufficiale è il 5 dicembre.' },
    ];

    const primaScrittura = roundTrip(JSON.stringify(seed));
    expect(roundTrip(primaScrittura)).toBe(primaScrittura);
    // La convergenza costa un solo salvataggio, e cambia questo: il primo
    // paragrafo diventa il lead d'apertura.
    expect(parseBody(primaScrittura)[0].type).toBe('lead');
  });
});

describe('textToBlocks e blocksToText', () => {
  // Restano per la migrazione dei contenuti scritti con i marcatori e per
  // eventuali importazioni: fuori dall'editor, ma non fuori dal progetto.
  it('sopravvivono al giro testo → blocchi → testo', () => {
    const testo = [
      'Apertura dell’articolo.',
      '## Una sezione',
      '- uno\n- due',
      '> Detta così\n-- La squadra',
    ].join('\n\n');

    expect(blocksToText(textToBlocks(testo))).toBe(testo);
  });

  it('danno un corpo che normalizeBody non riscrive', () => {
    const blocchi = serializeBody(normalizeBody(textToBlocks('Apertura.\n\n## Sezione')));
    expect(roundTrip(blocchi)).toBe(blocchi);
  });
});
