import { INLINE_LINK_SOURCE, INLINE_TOKEN_SOURCE, type BodyBlock } from './body';

/**
 * Il ponte fra il corpo salvato e il documento dell'editor.
 *
 * Nel database un articolo è `BodyBlock[]`, con la formattazione inline scritta
 * come marcatori dentro il testo (`**grassetto**`, `[testo](url)`). L'editor
 * ricco lavora invece su un documento in stile ProseMirror. Queste due funzioni
 * traducono l'uno nell'altro, e sono l'una l'inversa dell'altra: è la promessa
 * verificata da `tiptap.test.ts`, che aprire e risalvare non cambi niente.
 *
 * Perché il formato salvato non cambia: `renderInline` non inietta mai markup,
 * costruisce nodi React token per token. Se qui salvassimo HTML, quella garanzia
 * cadrebbe e i 12 articoli pubblicati andrebbero migrati.
 *
 * Il tipo del documento è dichiarato in casa e non importato da TipTap: sono
 * strutture dati, e tenerle libere da dipendenze rende questo file provabile
 * senza montare un editor.
 */

export type DocMark = { type: string; attrs?: Record<string, unknown> };

export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: DocMark[];
  text?: string;
};

export type EditorDoc = { type: 'doc'; content: DocNode[] };

/** Un solo marcatore per porzione di testo: il formato non ne annida. */
const MARK_ORDER = ['link', 'bold', 'italic', 'underline'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/* ========================================================================== *
 *  Andata: dal corpo salvato al documento dell'editor
 * ========================================================================== */

/** Spezza un testo con marcatori in nodi di testo con le relative marche. */
function textToInline(text: string): DocNode[] {
  if (!text) return [];

  const token = new RegExp(`(${INLINE_TOKEN_SOURCE})`, 'g');
  const link = new RegExp(INLINE_LINK_SOURCE);

  return text
    .split(token)
    .filter((part) => part !== '')
    .map((part): DocNode => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return { type: 'text', text: part.slice(2, -2), marks: [{ type: 'bold' }] };
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return { type: 'text', text: part.slice(2, -2), marks: [{ type: 'underline' }] };
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return { type: 'text', text: part.slice(1, -1), marks: [{ type: 'italic' }] };
      }

      const matched = part.match(link);
      if (matched) {
        return {
          type: 'text',
          text: matched[1],
          marks: [{ type: 'link', attrs: { href: matched[2] } }],
        };
      }

      return { type: 'text', text: part };
    });
}

function paragraph(text: string, lead = false): DocNode {
  const node: DocNode = { type: 'paragraph', content: textToInline(text) };
  // L'apertura è marcata, non dedotta dalla posizione: così il giro di ritorno
  // non deve indovinare quale paragrafo fosse il primo.
  if (lead) node.attrs = { lead: true };
  return node;
}

function blockToNode(block: BodyBlock): DocNode {
  switch (block.type) {
    case 'lead':
      return paragraph(block.text, true);

    case 'paragraph':
      return paragraph(block.text);

    case 'heading':
      // Il design prevede un solo livello di titolo dentro l'articolo.
      return { type: 'heading', attrs: { level: 2 }, content: textToInline(block.text) };

    case 'quote':
      return {
        type: 'blockquote',
        attrs: { attribution: block.attribution ?? null },
        content: [paragraph(block.text)],
      };

    case 'list':
      return {
        type: 'bulletList',
        content: block.items.map((item) => ({
          type: 'listItem',
          content: [paragraph(item)],
        })),
      };

    case 'image':
      return {
        type: 'image',
        attrs: {
          src: block.src ?? null,
          label: block.label,
          caption: block.caption ?? null,
        },
      };
  }
}

export function blocksToDoc(blocks: BodyBlock[]): EditorDoc {
  return { type: 'doc', content: blocks.map(blockToNode) };
}

/* ========================================================================== *
 *  Ritorno: dal documento dell'editor al corpo salvato
 * ========================================================================== */

/** Rimette i marcatori attorno al testo, uno solo per porzione. */
function inlineToText(nodes: DocNode[] | undefined): string {
  if (!nodes) return '';

  return nodes
    .map((node) => {
      if (node.type !== 'text' || typeof node.text !== 'string') return '';
      const text = node.text;
      if (!node.marks || node.marks.length === 0) return text;

      // Se l'editor ha prodotto marche sovrapposte se ne rende una sola: il
      // formato salvato non sa annidarle. Precedenza fissa, non casuale.
      const mark = MARK_ORDER.find((name) => node.marks?.some((m) => m.type === name));

      switch (mark) {
        case 'link': {
          const href = node.marks.find((m) => m.type === 'link')?.attrs?.href;
          return typeof href === 'string' ? `[${text}](${href})` : text;
        }
        case 'bold':
          return `**${text}**`;
        case 'italic':
          return `*${text}*`;
        case 'underline':
          return `__${text}__`;
        default:
          return text;
      }
    })
    .join('');
}

/** Il testo di un nodo che contiene un paragrafo (citazioni, voci di elenco). */
function firstParagraphText(node: DocNode): string {
  const paragraphNode = node.content?.find((child) => child.type === 'paragraph');
  return inlineToText(paragraphNode?.content);
}

function nodeToBlock(node: DocNode): BodyBlock | null {
  switch (node.type) {
    case 'paragraph': {
      const text = inlineToText(node.content);
      return node.attrs?.lead === true ? { type: 'lead', text } : { type: 'paragraph', text };
    }

    case 'heading':
      return { type: 'heading', text: inlineToText(node.content) };

    case 'blockquote': {
      const attribution = node.attrs?.attribution;
      // Stesse chiavi e stesso ordine di `parseBlock`: la colonna `body` salva
      // JSON.stringify, quindi un ordine diverso riscriverebbe l'articolo a ogni
      // apertura anche senza che nessuno lo abbia modificato. `undefined` non
      // viene serializzato, quindi la chiave sparisce come là.
      return {
        type: 'quote',
        text: firstParagraphText(node),
        attribution:
          typeof attribution === 'string' && attribution !== '' ? attribution : undefined,
      };
    }

    case 'bulletList':
      return {
        type: 'list',
        items: (node.content ?? [])
          .filter((item) => item.type === 'listItem')
          .map(firstParagraphText),
      };

    case 'image': {
      const { src, label, caption } = node.attrs ?? {};
      // Ordine delle chiavi come in `parseBlock`: type, label, caption, src.
      return {
        type: 'image',
        label: typeof label === 'string' ? label : 'FOTO: da definire',
        caption: typeof caption === 'string' && caption !== '' ? caption : undefined,
        src: typeof src === 'string' ? src : null,
      };
    }

    // Tutto il resto viene scartato: l'editor è configurato per non produrlo,
    // ma un documento può sempre arrivare da altrove.
    default:
      return null;
  }
}

/**
 * Un blocco di testo vuoto non è contenuto. L'editor ne tiene sempre uno in
 * fondo per poterci cliccare dentro, e chi scrive ne lascia altri per aria:
 * nessuno dei due deve finire nel database. `textToBlocks` faceva lo stesso
 * scartando i pezzi vuoti.
 */
function vuoto(block: BodyBlock): boolean {
  switch (block.type) {
    case 'lead':
    case 'paragraph':
    case 'heading':
    case 'quote':
      return block.text.trim() === '';
    case 'list':
      return block.items.every((item) => item.trim() === '');
    case 'image':
      return false;
  }
}

export function docToBlocks(doc: unknown): BodyBlock[] {
  if (!isRecord(doc) || !Array.isArray(doc.content)) return [];
  return (doc.content as DocNode[])
    .map(nodeToBlock)
    .filter((block): block is BodyBlock => block !== null && !vuoto(block));
}
