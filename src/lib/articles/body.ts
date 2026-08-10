/**
 * Il corpo di un articolo è una lista di blocchi tipizzati.
 * Sono esattamente i blocchi previsti dal design (README, mockup 2e):
 * lead, paragrafo, titolo di sezione, citazione, immagine con didascalia, elenco.
 *
 * Dentro i testi è ammessa una formattazione minima, resa da `renderInline`:
 *   **grassetto**  ·  *corsivo*  ·  __sottolineato__  ·  [testo](https://…)
 * Non si accetta HTML e non si inietta mai markup grezzo: quello che scrive il
 * redattore viene interpretato e trasformato in nodi React, uno per uno.
 *
 * Chi scrive non vede più questi marcatori: l'area di scrittura è un editor
 * ricco, e `lib/articles/tiptap.ts` traduce nei due sensi. I marcatori restano
 * però il formato salvato, perché è quello che tiene in piedi la garanzia qui
 * sopra — nel database non finisce mai markup, solo testo da interpretare.
 */

export type BodyBlock =
  | { type: 'lead'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; label: string; caption?: string; src?: string | null };

export const blockTypes = ['lead', 'paragraph', 'heading', 'quote', 'list', 'image'] as const;

/**
 * I marcatori inline ammessi, come sorgente di testo e non come espressione
 * già costruita: chi la usa se ne fabbrica una propria, così il flag `g` di
 * uno non sposta `lastIndex` dell'altro.
 *
 * Vale per il renderer pubblico (`inline.tsx`) e per l'editor (`tiptap.ts`).
 * Le due cose devono leggere gli stessi marcatori, altrimenti quello che si
 * vede nell'editor e quello che finisce in pagina divergono.
 *
 * Nota sul formato: i marcatori **non si annidano**. `[**testo**](url)` non è
 * un link in grassetto, è un link il cui testo contiene due asterischi.
 */
export const INLINE_TOKEN_SOURCE = String.raw`\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\)`;
export const INLINE_LINK_SOURCE = String.raw`^\[([^\]]+)\]\(([^)\s]+)\)$`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Valida un blocco arrivato dal client o dal database. */
export function parseBlock(value: unknown): BodyBlock | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;

  switch (value.type) {
    case 'lead':
    case 'paragraph':
    case 'heading':
      return typeof value.text === 'string'
        ? ({ type: value.type, text: value.text } as BodyBlock)
        : null;
    case 'quote':
      return typeof value.text === 'string'
        ? {
            type: 'quote',
            text: value.text,
            attribution: typeof value.attribution === 'string' ? value.attribution : undefined,
          }
        : null;
    case 'list':
      return Array.isArray(value.items)
        ? {
            type: 'list',
            items: value.items.filter((item): item is string => typeof item === 'string'),
          }
        : null;
    case 'image':
      return typeof value.label === 'string'
        ? {
            type: 'image',
            label: value.label,
            caption: typeof value.caption === 'string' ? value.caption : undefined,
            src: typeof value.src === 'string' ? value.src : null,
          }
        : null;
    default:
      return null;
  }
}

/** Legge la colonna `body` (JSON in TEXT) restituendo sempre una lista valida. */
export function parseBody(raw: string | null | undefined): BodyBlock[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseBlock).filter((block): block is BodyBlock => block !== null);
  } catch {
    return [];
  }
}

export function serializeBody(blocks: BodyBlock[]): string {
  return JSON.stringify(blocks);
}

export function stripMarks(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

/** Testo semplice del corpo: serve per tempo di lettura, incipit e SEO. */
export function bodyToPlainText(blocks: BodyBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'lead':
        case 'paragraph':
        case 'heading':
        case 'quote':
          return stripMarks(block.text);
        case 'list':
          return block.items.map(stripMarks).join(' ');
        case 'image':
          return block.caption ?? '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/** ~200 parole al minuto, arrotondate: "4 MIN DI LETTURA". */
export function readingMinutes(blocks: BodyBlock[]): number {
  const words = bodyToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** L'incipit mostrato nell'anteprima dell'editor. */
export function bodyIncipit(blocks: BodyBlock[], maxChars = 180): string {
  const first = blocks.find(
    (block) => (block.type === 'paragraph' || block.type === 'lead') && block.text.trim() !== '',
  );
  if (!first || (first.type !== 'paragraph' && first.type !== 'lead')) return '';
  const text = stripMarks(first.text).trim();
  return text.length > maxChars ? `${text.slice(0, maxChars).trimEnd()}…` : text;
}
