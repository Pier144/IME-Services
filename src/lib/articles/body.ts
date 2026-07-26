/**
 * Il corpo di un articolo è una lista di blocchi tipizzati.
 * Sono esattamente i blocchi previsti dal design (README, mockup 2e):
 * lead, paragrafo, titolo di sezione, citazione, immagine con didascalia, elenco.
 *
 * Dentro i testi è ammessa una formattazione minima, resa da `renderInline`:
 *   **grassetto**  ·  *corsivo*  ·  __sottolineato__  ·  [testo](https://…)
 * Non si accetta HTML e non si inietta mai markup grezzo: quello che scrive il
 * redattore viene interpretato e trasformato in nodi React, uno per uno.
 */

export type BodyBlock =
  | { type: 'lead'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; label: string; caption?: string; src?: string | null };

export const blockTypes = ['lead', 'paragraph', 'heading', 'quote', 'list', 'image'] as const;

const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]*)(?:\s+"([^"]*)")?\)$/;

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

/**
 * Converte il testo scritto nell'editor in blocchi.
 * Righe vuote separano i paragrafi; i prefissi replicano la barra strumenti.
 *   ## titolo   → titolo di sezione
 *   > citazione → citazione (una riga "— Attribuzione" subito dopo la lega)
 *   - voce      → elenco
 *   ![etichetta](src "didascalia") → immagine
 */
export function textToBlocks(input: string, { firstIsLead = true } = {}): BodyBlock[] {
  const chunks = input
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const blocks: BodyBlock[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((line) => line.trim());

    if (lines[0].startsWith('## ')) {
      blocks.push({ type: 'heading', text: lines[0].slice(3).trim() });
      continue;
    }

    if (lines[0].startsWith('> ')) {
      const quoteLines = lines.filter((line) => line.startsWith('> ')).map((line) => line.slice(2));
      const attributionLine = lines.find((line) => line.startsWith('— '));
      blocks.push({
        type: 'quote',
        text: quoteLines.join(' ').trim(),
        attribution: attributionLine?.replace(/^—\s*/, '').trim() || undefined,
      });
      continue;
    }

    if (lines.every((line) => line.startsWith('- '))) {
      blocks.push({ type: 'list', items: lines.map((line) => line.slice(2).trim()) });
      continue;
    }

    const image = lines[0].match(IMAGE_LINE);
    if (image) {
      blocks.push({
        type: 'image',
        label: image[1] || 'FOTO — da definire',
        src: image[2] || null,
        caption: image[3] || undefined,
      });
      continue;
    }

    const isFirstText =
      firstIsLead && !blocks.some((block) => block.type === 'lead' || block.type === 'paragraph');
    blocks.push({ type: isFirstText ? 'lead' : 'paragraph', text: chunk.replace(/\n/g, ' ') });
  }

  return blocks;
}

/** Il percorso inverso: dai blocchi al testo dell'area di scrittura. */
export function blocksToText(blocks: BodyBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `## ${block.text}`;
        case 'quote':
          return block.attribution ? `> ${block.text}\n— ${block.attribution}` : `> ${block.text}`;
        case 'list':
          return block.items.map((item) => `- ${item}`).join('\n');
        case 'image':
          return `![${block.label}](${block.src ?? ''}${block.caption ? ` "${block.caption}"` : ''})`;
        default:
          return block.text;
      }
    })
    .join('\n\n');
}
