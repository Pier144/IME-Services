'use client';

import { useEffect, useRef, useState } from 'react';
import type { EditorBlockType } from '@/lib/articles/editor-blocks';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * Il «+» nel margine e il menu dei blocchi.
 *
 * Inserisce sempre **sotto** il blocco a cui è affiancato. Si chiude su Esc, al
 * clic fuori e dopo la scelta; si percorre con le frecce, perché chi scrive ha
 * già le mani sulla tastiera e passare al mouse per aggiungere un paragrafo è
 * una interruzione.
 */
export function AddBlockMenu({ onAdd }: { onAdd: (type: EditorBlockType) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const voci: { type: EditorBlockType; name: string; hint: string }[] = [
    { type: 'paragraph', name: t.admin.editor.add.paragraph, hint: t.admin.editor.add.paragraphHint },
    { type: 'heading', name: t.admin.editor.add.heading, hint: t.admin.editor.add.headingHint },
    { type: 'quote', name: t.admin.editor.add.quote, hint: t.admin.editor.add.quoteHint },
    { type: 'list', name: t.admin.editor.add.list, hint: t.admin.editor.add.listHint },
    { type: 'image', name: t.admin.editor.add.image, hint: t.admin.editor.add.imageHint },
  ];

  /* Il clic fuori chiude: il menu non deve sopravvivere a chi ha cambiato idea. */
  useEffect(() => {
    if (!open) return;

    const away = (event: MouseEvent) => {
      if (container.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  useEffect(() => {
    if (open) items.current[0]?.focus();
  }, [open]);

  function onMenuKey(event: React.KeyboardEvent, index: number) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (index + step + voci.length) % voci.length;
    items.current[next]?.focus();
  }

  function scegli(type: EditorBlockType) {
    setOpen(false);
    onAdd(type);
  }

  return (
    <div ref={container} className="absolute top-0 -left-46 z-20">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t.admin.editor.add.open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        className={cn(
          'flex size-26 items-center justify-center border font-body text-15',
          'transition-colors duration-200 ease-out',
          open
            ? 'border-gold text-gold'
            : 'border-field-border text-ink-3 hover:border-gold hover:text-gold',
        )}
      >
        <span aria-hidden="true">+</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.admin.editor.add.title}
          className="absolute top-34 left-0 w-300 border border-hairline-strong bg-panel-ime py-8"
        >
          <p className="px-18 py-8 font-body text-9 font-medium tracking-20 text-ink-4">
            {t.admin.editor.add.title}
          </p>
          {voci.map((voce, index) => (
            <button
              key={voce.type}
              ref={(element) => {
                items.current[index] = element;
              }}
              type="button"
              role="menuitem"
              onClick={() => scegli(voce.type)}
              onKeyDown={(event) => onMenuKey(event, index)}
              className="block w-full px-18 py-10 text-left transition-colors duration-200 ease-out hover:bg-gold-rail focus-visible:bg-gold-rail"
            >
              <span className="block font-body text-14 font-medium text-ink">{voce.name}</span>
              <span className="mt-2 block font-body text-12 text-ink-4">{voce.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
