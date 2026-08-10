import { describe, expect, it } from 'vitest';
import {
  backspaceInBlock,
  backspaceInListItem,
  convertBlock,
  enterInBlock,
  enterInListItem,
  insertAfter,
  removeAt,
  toBody,
  toEditorBlocks,
  type EditorBlock,
} from './editor-blocks';
import { serializeBody, type BodyBlock } from './body';

/**
 * Le regole da tastiera si rompono in silenzio e a mano si provano male: si
 * scrive per venti minuti e ci si accorge dopo che un Backspace di troppo ha
 * mangiato un blocco. Qui stanno tutte, senza React.
 */

const paragrafo = (id: string, text = ''): EditorBlock => ({ id, type: 'paragraph', text });

describe('toEditorBlocks', () => {
  it('dà sempre un blocco in cui scrivere, anche su un articolo vuoto', () => {
    expect(toEditorBlocks([])).toEqual([{ id: 'b0', type: 'paragraph', text: '' }]);
  });

  it('fa entrare il lead come paragrafo: nella colonna non si distingue', () => {
    const blocks = toEditorBlocks([
      { type: 'lead', text: 'Apertura' },
      { type: 'paragraph', text: 'Seguito' },
    ]);
    expect(blocks.map((block) => block.type)).toEqual(['paragraph', 'paragraph']);
  });

  it('riempie i campi facoltativi invece di lasciarli indefiniti', () => {
    expect(toEditorBlocks([{ type: 'image', label: 'FOTO: piazza' }])).toEqual([
      { id: 'b0', type: 'image', label: 'FOTO: piazza', caption: '', src: null },
    ]);
  });
});

describe('toBody', () => {
  it('non lascia passare l’id nel database', () => {
    const salvato = toBody([paragrafo('b0', 'Apertura'), { id: 'b1', type: 'heading', text: 'Sezione' }]);
    expect(serializeBody(salvato)).toBe(
      JSON.stringify([
        { type: 'lead', text: 'Apertura' },
        { type: 'heading', text: 'Sezione' },
      ]),
    );
  });

  it('riapplica il lead al primo blocco di testo', () => {
    const salvato = toBody([
      { id: 'b0', type: 'heading', text: 'Prima' },
      paragrafo('b1', 'Poi'),
      paragrafo('b2', 'Ancora'),
    ]);
    expect(salvato.map((block) => block.type)).toEqual(['heading', 'lead', 'paragraph']);
  });

  it('scrive «FOTO: da definire» se la descrizione manca', () => {
    const salvato = toBody([{ id: 'b0', type: 'image', label: '  ', caption: '', src: null }]);
    expect(salvato).toEqual([
      { type: 'image', label: 'FOTO: da definire', caption: undefined, src: null },
    ]);
  });

  it('regge il giro completo senza riscrivere niente', () => {
    const body: BodyBlock[] = [
      { type: 'lead', text: 'Apertura' },
      { type: 'quote', text: 'Detta così', attribution: 'La squadra' },
      { type: 'list', items: ['uno', 'due'] },
      { type: 'image', label: 'FOTO: piazza', caption: 'Novembre', src: null },
    ];
    const primo = serializeBody(toBody(toEditorBlocks(body)));
    expect(serializeBody(toBody(toEditorBlocks(toBody(toEditorBlocks(body)))))).toBe(primo);
  });
});

describe('Invio', () => {
  it('apre un paragrafo nuovo sotto, con il cursore dentro', () => {
    const blocks = [paragrafo('b0', 'Una frase')];
    const change = enterInBlock(blocks, 0, 'b1', false);

    expect(change).not.toBeNull();
    expect(change?.blocks).toEqual([paragrafo('b0', 'Una frase'), paragrafo('b1')]);
    expect(change?.focus).toEqual({ blockId: 'b1' });
  });

  it('apre un paragrafo anche sotto un titolo di sezione', () => {
    const change = enterInBlock([{ id: 'b0', type: 'heading', text: 'Sezione' }], 0, 'b1', false);
    expect(change?.blocks[1]).toEqual(paragrafo('b1'));
  });

  it('con Maiusc lascia fare al campo: si va a capo dentro il blocco', () => {
    expect(enterInBlock([paragrafo('b0', 'Una frase')], 0, 'b1', true)).toBeNull();
  });

  it('dentro una citazione lascia fare al campo', () => {
    const blocks: EditorBlock[] = [{ id: 'b0', type: 'quote', text: 'Detta', attribution: '' }];
    expect(enterInBlock(blocks, 0, 'b1', false)).toBeNull();
  });

  it('in una voce di elenco apre la voce successiva', () => {
    const blocks: EditorBlock[] = [{ id: 'b0', type: 'list', items: ['uno', 'due'] }];
    const change = enterInListItem(blocks, 0, 0);

    expect(change?.blocks[0]).toEqual({ id: 'b0', type: 'list', items: ['uno', '', 'due'] });
    expect(change?.focus).toEqual({ blockId: 'b0', item: 1 });
  });
});

describe('Backspace', () => {
  it('su un blocco vuoto lo elimina e torna in fondo al precedente', () => {
    const blocks = [paragrafo('b0', 'Piena'), paragrafo('b1')];
    const change = backspaceInBlock(blocks, 1, true);

    expect(change?.blocks).toEqual([paragrafo('b0', 'Piena')]);
    expect(change?.focus).toEqual({ blockId: 'b0' });
  });

  it('su un blocco pieno non fa niente', () => {
    expect(backspaceInBlock([paragrafo('b0', 'Piena'), paragrafo('b1', 'x')], 1, false)).toBeNull();
  });

  it('non elimina mai l’ultimo blocco', () => {
    expect(backspaceInBlock([paragrafo('b0')], 0, true)).toBeNull();
    expect(removeAt([paragrafo('b0')], 0).blocks).toHaveLength(1);
  });

  it('torna in fondo all’elenco precedente, non alla sua prima voce', () => {
    const blocks: EditorBlock[] = [
      { id: 'b0', type: 'list', items: ['uno', 'due', 'tre'] },
      paragrafo('b1'),
    ];
    expect(backspaceInBlock(blocks, 1, true)?.focus).toEqual({ blockId: 'b0', item: 2 });
  });

  it('su una voce vuota elimina la voce', () => {
    const blocks: EditorBlock[] = [{ id: 'b0', type: 'list', items: ['uno', '', 'tre'] }];
    const change = backspaceInListItem(blocks, 0, 1, true);

    expect(change?.blocks[0]).toEqual({ id: 'b0', type: 'list', items: ['uno', 'tre'] });
    expect(change?.focus).toEqual({ blockId: 'b0', item: 0 });
  });

  it('sull’unica voce vuota elimina tutto il blocco', () => {
    const blocks: EditorBlock[] = [paragrafo('b0', 'Prima'), { id: 'b1', type: 'list', items: [''] }];
    const change = backspaceInListItem(blocks, 1, 0, true);

    expect(change?.blocks).toEqual([paragrafo('b0', 'Prima')]);
    expect(change?.focus).toEqual({ blockId: 'b0' });
  });
});

describe('il «+»', () => {
  it('inserisce sotto il blocco a cui è affiancato, non sopra', () => {
    const blocks = [paragrafo('b0', 'Prima'), paragrafo('b1', 'Dopo')];
    const change = insertAfter(blocks, 0, 'heading', 'b2');

    expect(change.blocks.map((block) => block.id)).toEqual(['b0', 'b2', 'b1']);
    expect(change.focus).toEqual({ blockId: 'b2' });
  });

  it('su un elenco nuovo mette il cursore nella prima voce', () => {
    expect(insertAfter([paragrafo('b0')], 0, 'list', 'b1').focus).toEqual({
      blockId: 'b1',
      item: 0,
    });
  });
});

describe('conversione del blocco', () => {
  it('conserva il testo passando a titolo', () => {
    const change = convertBlock([paragrafo('b0', 'Una frase')], 0, 'heading');
    expect(change.blocks[0]).toEqual({ id: 'b0', type: 'heading', text: 'Una frase' });
  });

  it('spezza il testo in voci passando a elenco', () => {
    const change = convertBlock([paragrafo('b0', 'uno\ndue')], 0, 'list');
    expect(change.blocks[0]).toEqual({ id: 'b0', type: 'list', items: ['uno', 'due'] });
  });

  it('rimette insieme le voci tornando a paragrafo', () => {
    const blocks: EditorBlock[] = [{ id: 'b0', type: 'list', items: ['uno', 'due'] }];
    expect(convertBlock(blocks, 0, 'paragraph').blocks[0]).toEqual(paragrafo('b0', 'uno due'));
  });

  it('non tocca una foto: convertirla vorrebbe dire buttarla via', () => {
    const blocks: EditorBlock[] = [{ id: 'b0', type: 'image', label: 'FOTO', caption: '', src: null }];
    expect(convertBlock(blocks, 0, 'paragraph').blocks).toBe(blocks);
  });
});
