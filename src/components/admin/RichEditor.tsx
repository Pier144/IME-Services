'use client';

import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useI18n } from '@/i18n/provider';
import type { BodyBlock } from '@/lib/articles/body';
import { blocksToDoc, docToBlocks } from '@/lib/articles/tiptap';
import { cn } from '@/lib/utils';

/**
 * L'area di scrittura dell'articolo.
 *
 * Sostituisce il riquadro di testo con i marcatori a vista: chi scrive vede il
 * grassetto in grassetto e i titoli come titoli. Il formato salvato però non
 * cambia — `docToBlocks` riporta tutto a `BodyBlock[]` con i marcatori nel
 * testo, quindi il sito pubblico non sa che questo file esiste.
 *
 * Il punto fermo: **l'editor è configurato per non poter produrre niente che il
 * modello dati non sappia contenere.** Blocchi di codice, righe orizzontali,
 * elenchi numerati, barrato e codice inline sono spenti; i titoli hanno un solo
 * livello. Non è prudenza: se l'editor generasse un nodo sconosciuto,
 * `docToBlocks` lo scarterebbe e il redattore vedrebbe sparire quello che ha
 * appena scritto.
 */

/** Attributi che il progetto aggiunge a nodi già esistenti. */
const AttributiArticolo = Extension.create({
  name: 'attributiArticolo',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          // L'apertura dell'articolo, resa più grande in pagina. È marcata e non
          // dedotta dalla posizione: vedi il commento in lib/articles/tiptap.ts.
          lead: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-lead') === 'true',
            renderHTML: (attributes) =>
              attributes.lead ? { 'data-lead': 'true' } : {},
          },
        },
      },
      {
        types: ['blockquote'],
        attributes: {
          attribution: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-attribution'),
            renderHTML: (attributes) =>
              attributes.attribution ? { 'data-attribution': attributes.attribution } : {},
          },
        },
      },
    ];
  },
});

/**
 * L'immagine nel corpo. Esiste già negli articoli seminati, quindi deve
 * esistere qui: senza, aprire un articolo con una foto la farebbe sparire.
 * Il caricamento per trascinamento arriva dopo (capitolo 4 del piano).
 */
const Immagine = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      label: { default: 'FOTO: da definire' },
      caption: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-immagine]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { label, caption } = node.attrs as { label: string; caption: string | null };
    return [
      'figure',
      mergeAttributes(HTMLAttributes, { 'data-immagine': '' }),
      ['div', { class: 'segnaposto' }, label],
      ...(caption ? [['figcaption', {}, caption] as const] : []),
    ];
  },
});

/* ========================================================================== */

type Comando = {
  chiave: string;
  etichetta: string;
  titolo: string;
  classe?: string;
  attivo: (editor: Editor) => boolean;
  esegui: (editor: Editor) => void;
};

const COMANDI: Comando[] = [
  {
    chiave: 'bold',
    etichetta: 'B',
    titolo: 'Grassetto',
    classe: 'font-bold',
    attivo: (e) => e.isActive('bold'),
    esegui: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    chiave: 'italic',
    etichetta: 'I',
    titolo: 'Corsivo',
    classe: 'italic',
    attivo: (e) => e.isActive('italic'),
    esegui: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    chiave: 'underline',
    etichetta: 'U',
    titolo: 'Sottolineato',
    classe: 'underline',
    attivo: (e) => e.isActive('underline'),
    esegui: (e) => e.chain().focus().toggleUnderline().run(),
  },
  {
    chiave: 'heading',
    etichetta: 'Titolo',
    titolo: 'Titolo di sezione',
    attivo: (e) => e.isActive('heading', { level: 2 }),
    esegui: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    chiave: 'quote',
    etichetta: 'Citazione',
    titolo: 'Citazione',
    attivo: (e) => e.isActive('blockquote'),
    esegui: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    chiave: 'list',
    etichetta: 'Elenco',
    titolo: 'Elenco puntato',
    attivo: (e) => e.isActive('bulletList'),
    esegui: (e) => e.chain().focus().toggleBulletList().run(),
  },
];

export function RichEditor({
  blocks,
  onChange,
}: {
  blocks: BodyBlock[];
  onChange: (next: BodyBlock[]) => void;
}) {
  const { t } = useI18n();

  const editor = useEditor({
    // Obbligatorio con il rendering sul server: senza, il primo disegno del
    // browser non combacia con quello del server e React se ne lamenta.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Spente perché produrrebbero blocchi che `BodyBlock` non sa contenere.
        codeBlock: false,
        horizontalRule: false,
        orderedList: false,
        code: false,
        strike: false,
        // Un a-capo dentro il paragrafo non sopravviverebbe al salvataggio:
        // meglio non farlo scrivere che perderlo in silenzio.
        hardBreak: false,
        // Il design prevede un solo livello di titolo dentro l'articolo.
        heading: { levels: [2] },
      }),
      AttributiArticolo,
      Immagine,
    ],
    content: blocksToDoc(blocks),
    onUpdate: ({ editor: istanza }) => onChange(docToBlocks(istanza.getJSON())),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-200 px-16 py-16',
        'aria-label': t.admin.editor.labels.body,
      },
    },
  });

  return (
    <div className="border border-field-border">
      <div className="flex flex-wrap gap-14 border-b border-rule-toolbar bg-toolbar-bg px-14 py-9 font-body text-13 text-ink-2">
        {COMANDI.map((comando) => {
          const attivo = editor ? comando.attivo(editor) : false;
          return (
            <button
              key={comando.chiave}
              type="button"
              title={comando.titolo}
              aria-pressed={attivo}
              disabled={!editor}
              onClick={() => editor && comando.esegui(editor)}
              className={cn(
                'transition-colors duration-200 hover:text-gold disabled:opacity-40',
                // Lo stato attivo con i marcatori non era mostrabile: si vedeva
                // solo leggendo il testo. Ora il pulsante lo dice.
                attivo && 'text-gold',
                comando.classe,
              )}
            >
              {comando.etichetta}
            </button>
          );
        })}
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          'bg-field-bg font-body text-15 leading-185 font-medium text-ink-2',
          // Stili del contenuto: ProseMirror genera i tag da sé, quindi si
          // raggiungono dai discendenti invece che con classi sui nodi.
          '[&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:font-display [&_h2]:text-18 [&_h2]:text-ink',
          '[&_p]:mb-10 [&_p[data-lead=true]]:text-17 [&_p[data-lead=true]]:text-ink',
          '[&_blockquote]:my-14 [&_blockquote]:border-l [&_blockquote]:border-gold [&_blockquote]:pl-14 [&_blockquote]:text-ink',
          '[&_ul]:mb-10 [&_ul]:list-disc [&_ul]:pl-20',
          '[&_a]:text-gold [&_a]:underline',
          '[&_figure]:my-14 [&_figure]:border [&_figure]:border-hairline',
          '[&_figure_.segnaposto]:flex [&_figure_.segnaposto]:h-90 [&_figure_.segnaposto]:items-center [&_figure_.segnaposto]:justify-center',
          '[&_figure_.segnaposto]:bg-photo-bg [&_figure_.segnaposto]:text-11 [&_figure_.segnaposto]:tracking-10 [&_figure_.segnaposto]:text-photo-label',
          '[&_figcaption]:px-12 [&_figcaption]:py-8 [&_figcaption]:text-12-5 [&_figcaption]:text-ink-3',
        )}
      />
    </div>
  );
}
