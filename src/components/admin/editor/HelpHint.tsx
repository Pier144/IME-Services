'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/provider';
import { cn } from '@/lib/utils';

/**
 * Il «?» che spiega un campo.
 *
 * Si apre al clic e non al passaggio del mouse, per tre motivi: su un telefono
 * il passaggio del mouse non esiste, da tastiera nemmeno, e una spiegazione che
 * svanisce appena provi a leggerla con calma non è una spiegazione.
 *
 * Resta aperto finché non lo chiudi — Esc, clic fuori, o di nuovo il «?».
 */
export function HelpHint({
  label,
  placement = 'below',
  align = 'right',
  children,
}: {
  /** Il campo che si sta spiegando: entra nel nome accessibile del pulsante. */
  label: string;
  placement?: 'below' | 'above';
  /**
   * `stretch` fa larga la spiegazione quanto la riga che la contiene, invece
   * di darle una larghezza sua. Serve nel pannello da 320px, dove un riquadro
   * a misura fissa ancorato al «?» uscirebbe da un lato o dall'altro a seconda
   * di dove capita l'etichetta. Chi la usa deve mettere `relative` sulla riga.
   */
  align?: 'left' | 'right' | 'stretch';
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = `aiuto-${label.replace(/\W+/g, '-').toLowerCase()}`;

  useEffect(() => {
    if (!open) return;

    const away = (event: MouseEvent) => {
      if (container.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Il fuoco torna al «?»: chi naviga da tastiera non deve ricominciare.
      trigger.current?.focus();
    };

    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const stretch = align === 'stretch';

  return (
    <span
      ref={container}
      className={cn('inline-block leading-100', !stretch && 'relative')}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={`${t.admin.editor.help.open}: ${label}`}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex size-14 items-center justify-center rounded-pill border font-body text-9 font-medium',
          'transition-colors duration-200 ease-out',
          open ? 'border-gold text-gold' : 'border-field-border text-ink-4 hover:border-gold hover:text-gold',
        )}
      >
        <span aria-hidden="true">?</span>
      </button>

      {open && (
        <span
          id={id}
          role="note"
          className={cn(
            'absolute z-50 block rounded-soft border border-hairline-strong bg-panel-ime px-14 py-12',
            // Le etichette attorno sono maiuscole e spaziate: la spiegazione no,
            // altrimenti diventa illeggibile proprio dove serve leggere.
            'font-body text-12-5 leading-170 font-normal tracking-0 text-ink-2 normal-case',
            stretch
              ? 'top-full right-0 left-0 mt-8'
              : cn(
                  'w-260',
                  placement === 'below' ? 'top-20' : 'bottom-20',
                  align === 'right' ? 'right-0' : 'left-0',
                ),
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
