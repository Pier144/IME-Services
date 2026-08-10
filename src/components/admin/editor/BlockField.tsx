'use client';

import { AddBlockMenu } from './AddBlockMenu';
import { AutoTextarea } from './AutoTextarea';
import { PhotoPicker, type UsedImage } from './PhotoPicker';
import { PhotoSlot } from '@/components/media/PhotoSlot';
import type { EditorBlock, EditorBlockType } from '@/lib/articles/editor-blocks';
import { useI18n } from '@/i18n/provider';

/**
 * Un blocco nella colonna di scrittura.
 *
 * I corpi sono quelli di `ArticleBody` in `scale="article"`: chi scrive vede la
 * misura vera del testo che uscirà, non un'approssimazione da modulo. Da qui
 * l'assenza di riquadri — il bordo attorno a un campo direbbe «stai compilando
 * un form», e invece si sta scrivendo un articolo.
 */
export function BlockField({
  block,
  index,
  register,
  onAdd,
  onText,
  onAttribution,
  onListItem,
  onImage,
  onKeyDown,
  onListKeyDown,
  onSelect,
  onLeave,
  used,
  toolbar,
}: {
  block: EditorBlock;
  index: number;
  register: (key: string) => (element: HTMLTextAreaElement | HTMLInputElement | null) => void;
  onAdd: (index: number, type: EditorBlockType) => void;
  onText: (index: number, text: string) => void;
  onAttribution: (index: number, attribution: string) => void;
  onListItem: (index: number, item: number, text: string) => void;
  onImage: (index: number, patch: Partial<{ label: string; caption: string; src: string | null }>) => void;
  onKeyDown: (event: React.KeyboardEvent, index: number) => void;
  onListKeyDown: (event: React.KeyboardEvent, index: number, item: number) => void;
  onSelect: (index: number) => void;
  /** Il fuoco ha lasciato il campo: la barra di formattazione se ne va con lui. */
  onLeave: () => void;
  used: UsedImage[];
  toolbar?: React.ReactNode;
}) {
  const { t } = useI18n();
  const p = t.admin.editor.placeholders;

  return (
    <div className="relative mt-26">
      <AddBlockMenu onAdd={(type) => onAdd(index, type)} />
      {toolbar}

      {(block.type === 'paragraph' || block.type === 'heading') && (
        <AutoTextarea
          value={block.text}
          fieldRef={register(block.id)}
          aria-label={block.type === 'heading' ? p.headingLabel : p.paragraphLabel}
          placeholder={block.type === 'heading' ? p.heading : p.paragraph}
          onChange={(event) => onText(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(event, index)}
          onSelect={() => onSelect(index)}
          onBlur={onLeave}
          className={
            block.type === 'heading'
              ? 'mt-14 font-display text-28 leading-122 font-medium text-ink'
              : 'font-body text-17 leading-185 text-ink-2'
          }
        />
      )}

      {block.type === 'quote' && (
        <div className="my-8 border-l-2 border-gold py-6 pl-26">
          <AutoTextarea
            value={block.text}
            fieldRef={register(block.id)}
            aria-label={p.quoteLabel}
            placeholder={p.quote}
            onChange={(event) => onText(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            onSelect={() => onSelect(index)}
            onBlur={onLeave}
            className="font-display text-24 leading-150 font-medium text-white"
          />
          {/* Le virgolette «» le mette il renderer della pagina: qui si scrive
              la frase nuda, altrimenti finirebbero salvate nel testo. */}
          <div className="mt-14 flex items-center gap-10">
            <span aria-hidden="true" className="block h-1 w-16 flex-none bg-ink-3" />
            <input
              value={block.attribution}
              aria-label={p.attributionLabel}
              placeholder={p.attribution}
              onChange={(event) => onAttribution(index, event.target.value)}
              className="flex-1 border-0 bg-transparent p-0 font-body text-12 tracking-18 text-ink-3 uppercase outline-none placeholder:text-ink-4"
            />
          </div>
        </div>
      )}

      {block.type === 'list' && (
        <ul className="flex flex-col gap-10">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-baseline gap-12">
              <span
                aria-hidden="true"
                className="relative -top-4 block h-1 w-12 flex-none bg-gold"
              />
              <input
                value={item}
                ref={register(`${block.id}:${itemIndex}`)}
                aria-label={p.listItemLabel}
                placeholder={p.listItem}
                onChange={(event) => onListItem(index, itemIndex, event.target.value)}
                onKeyDown={(event) => onListKeyDown(event, index, itemIndex)}
                className="min-w-0 flex-1 border-0 bg-transparent p-0 font-body text-17 leading-170 text-ink-2 outline-none placeholder:text-ink-4"
              />
            </li>
          ))}
        </ul>
      )}

      {block.type === 'image' && (
        <div>
          {block.src ? (
            <div className="relative">
              <PhotoSlot
                label={block.label || p.photoLabel}
                src={block.src}
                alt={block.label}
                className="h-340"
                sizes="(max-width: 1200px) 100vw, 740px"
              />
              <button
                type="button"
                onClick={() => onImage(index, { src: null })}
                className="absolute top-8 right-8 rounded-soft border border-field-border bg-admin-bg px-10 py-6 font-body text-12 font-medium text-ink-3 transition-colors duration-200 ease-out hover:border-gold hover:text-gold"
              >
                {t.admin.editor.photo.remove}
              </button>
            </div>
          ) : (
            <PhotoPicker
              id={`foto-${block.id}`}
              label={t.admin.editor.photo.field}
              variant="block"
              used={used}
              onPick={(image) =>
                onImage(index, { src: image.src, ...(block.label ? {} : { label: image.label }) })
              }
            />
          )}

          {/* Due righe sole, senza riquadro: la descrizione sta accanto alla
              foto perché è lì che ci si ricorda di scriverla. */}
          <div className="mt-10 flex flex-col gap-8">
            <input
              value={block.caption}
              aria-label={t.admin.editor.photo.caption}
              placeholder={t.admin.editor.photo.caption}
              onChange={(event) => onImage(index, { caption: event.target.value })}
              className="w-full border-0 border-b border-field-border bg-transparent px-0 py-8 font-body text-13 text-ink-2 outline-none placeholder:text-ink-4 focus:border-gold"
            />
            <input
              value={block.label}
              aria-label={t.admin.editor.photo.alt}
              placeholder={t.admin.editor.photo.alt}
              onChange={(event) => onImage(index, { label: event.target.value })}
              className="w-full border-0 border-b border-field-border bg-transparent px-0 py-8 font-body text-13 text-ink-2 outline-none placeholder:text-ink-4 focus:border-gold"
            />
          </div>
        </div>
      )}
    </div>
  );
}
