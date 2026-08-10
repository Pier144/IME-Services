'use client';

import { useEffect, useRef, useState } from 'react';
import type { EditorBlockType } from '@/lib/articles/editor-blocks';
import type { InlineMark } from '@/lib/articles/inline-marks';
import { useI18n } from '@/i18n/provider';

/**
 * La barra che compare sopra il testo selezionato.
 *
 * Sta sopra il blocco, mai sopra la selezione: coprire proprio le parole che si
 * stanno per formattare sarebbe il modo più veloce per far sbagliare.
 *
 * Il `preventDefault` sul mousedown è la riga che tiene in piedi tutto: senza,
 * premere un pulsante toglie il fuoco al campo, la selezione svanisce e il
 * marcatore finisce su niente.
 */
export function SelectionToolbar({
  onMark,
  onConvert,
  onLink,
}: {
  onMark: (mark: InlineMark) => void;
  onConvert: (type: EditorBlockType) => void;
  onLink: (href: string) => void;
}) {
  const { t } = useI18n();
  const [linking, setLinking] = useState(false);
  const [href, setHref] = useState('');
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (linking) field.current?.focus();
  }, [linking]);

  function conferma() {
    onLink(href);
    setHref('');
    setLinking(false);
  }

  return (
    <div
      onMouseDown={(event) => event.preventDefault()}
      className="absolute -top-46 left-0 z-30 flex items-center gap-16 border border-hairline-strong bg-panel-ime px-14 py-9 font-body text-13 text-ink-2"
    >
      {linking ? (
        <>
          <input
            ref={field}
            value={href}
            aria-label={t.admin.editor.marks.link}
            placeholder={t.admin.editor.marks.linkPlaceholder}
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                conferma();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                setLinking(false);
              }
            }}
            className="w-220 border-0 bg-transparent p-0 outline-none placeholder:text-ink-4"
          />
          <button type="button" onClick={conferma} className="font-medium text-gold">
            {t.admin.editor.marks.linkConfirm}
          </button>
        </>
      ) : (
        <>
          <Voce onClick={() => onMark('bold')} title={t.admin.editor.marks.bold}>
            <span className="font-semibold">B</span>
          </Voce>
          <Voce onClick={() => onMark('italic')} title={t.admin.editor.marks.italic}>
            <span className="italic">I</span>
          </Voce>
          <Voce onClick={() => onMark('underline')} title={t.admin.editor.marks.underline}>
            <span className="underline underline-offset-2">U</span>
          </Voce>

          <span aria-hidden="true" className="block h-16 w-1 flex-none bg-rule-step" />

          <Voce onClick={() => onConvert('heading')}>{t.admin.editor.marks.heading}</Voce>
          <Voce onClick={() => onConvert('quote')}>{t.admin.editor.marks.quote}</Voce>
          <Voce onClick={() => onConvert('list')}>{t.admin.editor.marks.list}</Voce>

          <Voce onClick={() => setLinking(true)} gold>
            {t.admin.editor.marks.link}
          </Voce>
        </>
      )}
    </div>
  );
}

function Voce({
  onClick,
  title,
  gold,
  children,
}: {
  onClick: () => void;
  title?: string;
  gold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`whitespace-nowrap transition-colors duration-200 ease-out ${
        gold ? 'text-gold hover:text-gold-hover' : 'hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}
