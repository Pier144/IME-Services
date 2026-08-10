import { describe, expect, it } from 'vitest';
import { articlePayloadSchema, publishBlockers } from './article';
import { serializeBody, type BodyBlock } from '@/lib/articles/body';
import { toBody, toEditorBlocks } from '@/lib/articles/editor-blocks';

/**
 * La validazione è anche la porta delle scritture: se il payload passa di qui,
 * il corpo è già nella forma canonica. Nessuna rotta deve doverci pensare.
 */

const minimo = { title: 'Titolo', slug: 'titolo', excerpt: 'Sommario' };

describe('articlePayloadSchema · corpo', () => {
  it('accetta i blocchi e li restituisce normalizzati', () => {
    const parsed = articlePayloadSchema.safeParse({
      ...minimo,
      body: [
        { type: 'paragraph', text: 'Apertura' },
        { type: 'image', label: 'FOTO: piazza', src: null, caption: 'Novembre' },
      ],
    });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    expect(serializeBody(parsed.data.body)).toBe(
      JSON.stringify([
        { type: 'lead', text: 'Apertura' },
        { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: null },
      ]),
    );
  });

  it('senza corpo dà una lista vuota', () => {
    const parsed = articlePayloadSchema.safeParse(minimo);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.body).toEqual([]);
  });

  it('rifiuta un blocco malformato invece di scartarlo in silenzio', () => {
    const parsed = articlePayloadSchema.safeParse({
      ...minimo,
      body: [{ type: 'paragraph', text: 'Buono' }, { type: 'paragraph' }],
    });

    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    // L'indice dice quale blocco: senza, il messaggio non aiuterebbe nessuno.
    expect(parsed.error.issues[0].path).toContain(1);
  });

  it('rifiuta un corpo più lungo del tetto', () => {
    const troppi = Array.from({ length: 501 }, () => ({ type: 'paragraph', text: 'x' }));
    expect(articlePayloadSchema.safeParse({ ...minimo, body: troppi }).success).toBe(false);
  });
});

describe('il contratto fra editor e rotta', () => {
  // Il punto di rottura più probabile: l'editor cambia forma ai blocchi e la
  // rotta comincia a rifiutarli, o peggio li accetta cambiandoli.
  const articolo: BodyBlock[] = [
    { type: 'lead', text: 'Apertura' },
    { type: 'heading', text: 'Sezione' },
    { type: 'quote', text: 'Detta così', attribution: 'La squadra' },
    { type: 'list', items: ['uno', 'due'] },
    { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: '/api/media/uno.jpg' },
  ];

  it('accetta senza modifiche quello che l’editor manda', () => {
    const inviato = toBody(toEditorBlocks(articolo));
    const parsed = articlePayloadSchema.safeParse({ ...minimo, body: inviato });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(serializeBody(parsed.data.body)).toBe(serializeBody(inviato));
  });

  it('accetta un articolo appena aperto, con il solo blocco vuoto', () => {
    const parsed = articlePayloadSchema.safeParse({ ...minimo, body: toBody(toEditorBlocks([])) });

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.body).toEqual([{ type: 'lead', text: '' }]);
  });
});

describe('publishBlockers', () => {
  it('elenca quello che manca, in ordine', () => {
    expect(
      publishBlockers({ title: '', category: '', coverImage: null, excerpt: '' }),
    ).toEqual(['titolo', 'categoria', 'copertina', 'sommario']);
  });

  it('non blocca un articolo completo', () => {
    expect(
      publishBlockers({
        title: 'Titolo',
        category: 'progetti',
        coverImage: '/foto/uno.jpg',
        excerpt: 'Sommario',
      }),
    ).toEqual([]);
  });
});
