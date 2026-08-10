import { normalizeBody, type BodyBlock } from './body';

/**
 * I blocchi come li maneggia l'editor.
 *
 * Due differenze rispetto a `BodyBlock`, entrambe volute:
 *
 * - ogni blocco ha un `id`, che serve solo a React e al fuoco della tastiera e
 *   non arriva mai al database: `toBody` lo lascia fuori passando per
 *   `normalizeBody`;
 * - il `lead` non esiste. Nella colonna di scrittura il primo paragrafo non si
 *   distingue dagli altri, e la regola viene riapplicata al salvataggio: così
 *   spostare un paragrafo non richiede di ricordarsi di cambiargli tipo.
 *
 * Tutto quello che sta qui è logica pura, senza React: sono le regole che si
 * rompono senza far rumore — Invio che spezza il blocco, Backspace che lo
 * elimina, l'ultimo blocco che non si cancella mai — e vanno sotto test.
 */

export type EditorBlockType = 'paragraph' | 'heading' | 'quote' | 'list' | 'image';

export type EditorBlock =
  | { id: string; type: 'paragraph' | 'heading'; text: string }
  | { id: string; type: 'quote'; text: string; attribution: string }
  | { id: string; type: 'list'; items: string[] }
  | { id: string; type: 'image'; label: string; caption: string; src: string | null };

/** Dove va il cursore dopo un'operazione. `item` solo per le voci di elenco. */
export type FocusTarget = { blockId: string; item?: number };

/**
 * Una foto già presente in un articolo.
 *
 * Sta qui, e non nel componente che la mostra né nel repository che la legge,
 * perché la attraversano entrambi: il server la ricava dal database, il client
 * la disegna, e il tipo non deve trascinare `server-only` nel browser.
 */
export type UsedImage = { src: string; label: string };

export type BlocksChange = { blocks: EditorBlock[]; focus: FocusTarget | null };

/** Chiave con cui il livello React ritrova il campo da mettere a fuoco. */
export function focusKey(target: FocusTarget): string {
  return target.item === undefined ? target.blockId : `${target.blockId}:${target.item}`;
}

export function createBlock(id: string, type: EditorBlockType): EditorBlock {
  switch (type) {
    case 'quote':
      return { id, type, text: '', attribution: '' };
    case 'list':
      return { id, type, items: [''] };
    case 'image':
      return { id, type, label: '', caption: '', src: null };
    default:
      return { id, type, text: '' };
  }
}

/** Il fuoco naturale di un blocco: la sua ultima voce se è un elenco. */
function endOf(block: EditorBlock): FocusTarget {
  return block.type === 'list'
    ? { blockId: block.id, item: Math.max(0, block.items.length - 1) }
    : { blockId: block.id };
}

/* --------------------------------------------------------------------------
 * Conversioni con il modello salvato
 * ----------------------------------------------------------------------- */

export function toEditorBlocks(body: readonly BodyBlock[], prefix = 'b'): EditorBlock[] {
  const blocks = body.map((block, index): EditorBlock => {
    const id = `${prefix}${index}`;
    switch (block.type) {
      // Il lead entra come paragrafo: la differenza torna al salvataggio.
      case 'lead':
      case 'paragraph':
        return { id, type: 'paragraph', text: block.text };
      case 'heading':
        return { id, type: 'heading', text: block.text };
      case 'quote':
        return { id, type: 'quote', text: block.text, attribution: block.attribution ?? '' };
      case 'list':
        return { id, type: 'list', items: block.items.length > 0 ? [...block.items] : [''] };
      case 'image':
        return {
          id,
          type: 'image',
          label: block.label,
          caption: block.caption ?? '',
          src: block.src ?? null,
        };
    }
  });

  // Un foglio bianco è comunque un foglio: c'è sempre un blocco in cui scrivere.
  return blocks.length > 0 ? blocks : [createBlock(`${prefix}0`, 'paragraph')];
}

/**
 * Dai blocchi dell'editor a quelli del database.
 *
 * Passa da `normalizeBody`, che è l'unico ordine di chiavi ammesso: l'`id` non
 * sopravvive al viaggio perché `parseBlock` copia solo le chiavi che conosce.
 */
export function toBody(blocks: readonly EditorBlock[]): BodyBlock[] {
  return normalizeBody(
    blocks.map((block) => {
      switch (block.type) {
        case 'quote':
          return { type: 'quote', text: block.text, attribution: block.attribution || undefined };
        case 'list':
          return { type: 'list', items: block.items };
        case 'image':
          return {
            type: 'image',
            // La descrizione per chi non vede la foto non è facoltativa: se
            // manca resta scritto che manca, come faceva già `textToBlocks`.
            label: block.label.trim() || 'FOTO: da definire',
            caption: block.caption || undefined,
            src: block.src,
          };
        default:
          return { type: block.type, text: block.text };
      }
    }),
  );
}

/* --------------------------------------------------------------------------
 * Modifiche al contenuto
 * ----------------------------------------------------------------------- */

function replaceAt(
  blocks: readonly EditorBlock[],
  index: number,
  block: EditorBlock,
): EditorBlock[] {
  return blocks.map((current, i) => (i === index ? block : current));
}

export function setText(blocks: readonly EditorBlock[], index: number, text: string) {
  const block = blocks[index];
  if (!block || (block.type !== 'paragraph' && block.type !== 'heading' && block.type !== 'quote')) {
    return blocks as EditorBlock[];
  }
  return replaceAt(blocks, index, { ...block, text });
}

export function setAttribution(
  blocks: readonly EditorBlock[],
  index: number,
  attribution: string,
) {
  const block = blocks[index];
  if (!block || block.type !== 'quote') return blocks as EditorBlock[];
  return replaceAt(blocks, index, { ...block, attribution });
}

export function setListItem(
  blocks: readonly EditorBlock[],
  index: number,
  item: number,
  text: string,
) {
  const block = blocks[index];
  if (!block || block.type !== 'list') return blocks as EditorBlock[];
  const items = block.items.map((current, i) => (i === item ? text : current));
  return replaceAt(blocks, index, { ...block, items });
}

export function setImage(
  blocks: readonly EditorBlock[],
  index: number,
  patch: Partial<{ label: string; caption: string; src: string | null }>,
) {
  const block = blocks[index];
  if (!block || block.type !== 'image') return blocks as EditorBlock[];
  return replaceAt(blocks, index, { ...block, ...patch });
}

/* --------------------------------------------------------------------------
 * Struttura: inserire, togliere, convertire
 * ----------------------------------------------------------------------- */

/** Inserisce **sotto** il blocco indicato, e ci porta il cursore. */
export function insertAfter(
  blocks: readonly EditorBlock[],
  index: number,
  type: EditorBlockType,
  id: string,
): BlocksChange {
  const created = createBlock(id, type);
  const next = blocks.slice();
  next.splice(index + 1, 0, created);
  return { blocks: next, focus: { blockId: id, ...(type === 'list' ? { item: 0 } : {}) } };
}

/**
 * Elimina un blocco e porta il cursore in fondo al precedente.
 *
 * L'ultimo blocco non si elimina mai: resterebbe un foglio senza punti in cui
 * scrivere, e non ci sarebbe modo di ricominciare.
 */
export function removeAt(blocks: readonly EditorBlock[], index: number): BlocksChange {
  if (blocks.length <= 1) return { blocks: blocks as EditorBlock[], focus: null };

  const next = blocks.slice();
  next.splice(index, 1);
  const previous = next[Math.max(0, index - 1)];
  return { blocks: next, focus: previous ? endOf(previous) : null };
}

/** Cambia il tipo del blocco corrente conservando quello che c'è scritto. */
export function convertBlock(
  blocks: readonly EditorBlock[],
  index: number,
  type: EditorBlockType,
): BlocksChange {
  const block = blocks[index];
  // Una foto non ha un testo da portarsi dietro: convertirla vorrebbe dire
  // buttarla via in silenzio.
  if (!block || block.type === 'image' || type === 'image' || block.type === type) {
    return { blocks: blocks as EditorBlock[], focus: null };
  }

  const text = block.type === 'list' ? block.items.filter(Boolean).join(' ') : block.text;

  const converted: EditorBlock =
    type === 'quote'
      ? { id: block.id, type: 'quote', text, attribution: '' }
      : type === 'list'
        ? {
            id: block.id,
            type: 'list',
            items: block.type === 'list' ? block.items : splitIntoItems(text),
          }
        : { id: block.id, type, text };

  return { blocks: replaceAt(blocks, index, converted), focus: endOf(converted) };
}

function splitIntoItems(text: string): string[] {
  const items = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  return items.length > 0 ? items : [''];
}

/* --------------------------------------------------------------------------
 * Tastiera
 * ----------------------------------------------------------------------- */

/**
 * Invio in un paragrafo o in un titolo: chiude il blocco e ne apre uno nuovo.
 *
 * Non spezza il testo al cursore — è il comportamento del prototipo, e chi
 * scrive preme Invio in fondo a una frase, non in mezzo.
 * Restituisce `null` quando l'Invio va lasciato al campo (Maiusc+Invio, e
 * dentro una citazione, dove andare a capo serve).
 */
export function enterInBlock(
  blocks: readonly EditorBlock[],
  index: number,
  id: string,
  shiftKey: boolean,
): BlocksChange | null {
  const block = blocks[index];
  if (!block || shiftKey) return null;
  if (block.type !== 'paragraph' && block.type !== 'heading') return null;
  return insertAfter(blocks, index, 'paragraph', id);
}

/** Invio in una voce di elenco: una voce nuova subito sotto. */
export function enterInListItem(
  blocks: readonly EditorBlock[],
  index: number,
  item: number,
): BlocksChange | null {
  const block = blocks[index];
  if (!block || block.type !== 'list') return null;

  const items = block.items.slice();
  items.splice(item + 1, 0, '');
  return {
    blocks: replaceAt(blocks, index, { ...block, items }),
    focus: { blockId: block.id, item: item + 1 },
  };
}

/** Backspace su un blocco vuoto: lo elimina. Su blocco pieno non fa niente. */
export function backspaceInBlock(
  blocks: readonly EditorBlock[],
  index: number,
  isEmpty: boolean,
): BlocksChange | null {
  if (!isEmpty || !blocks[index]) return null;
  const change = removeAt(blocks, index);
  // Con un blocco solo non succede niente: meglio non far finta di sì.
  return change.blocks === blocks ? null : change;
}

/**
 * Backspace su una voce di elenco vuota: elimina la voce; se era l'unica,
 * elimina il blocco.
 */
export function backspaceInListItem(
  blocks: readonly EditorBlock[],
  index: number,
  item: number,
  isEmpty: boolean,
): BlocksChange | null {
  const block = blocks[index];
  if (!isEmpty || !block || block.type !== 'list') return null;

  if (block.items.length <= 1) {
    const change = removeAt(blocks, index);
    return change.blocks === blocks ? null : change;
  }

  const items = block.items.slice();
  items.splice(item, 1);
  return {
    blocks: replaceAt(blocks, index, { ...block, items }),
    focus: { blockId: block.id, item: Math.max(0, item - 1) },
  };
}
