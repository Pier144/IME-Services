'use client';

import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type AutoTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
  value: string;
  /** Registra il campo presso `useBlockFocus`. */
  fieldRef?: (element: HTMLTextAreaElement | null) => void;
};

/**
 * Campo di scrittura che cresce con il testo.
 *
 * Senza bordo, senza fondo, senza raggio e senza barra di scorrimento: la
 * pagina è un foglio, e un foglio non ha caselle. L'altezza si ricalcola a ogni
 * modifica e a ogni cambio di larghezza, perché è la larghezza a decidere
 * quante righe servono.
 */
export function AutoTextarea({ value, className, fieldRef, ...rest }: AutoTextareaProps) {
  const own = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const element = own.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  useEffect(() => resize(), [value, resize]);

  useEffect(() => {
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  return (
    <textarea
      ref={(element) => {
        own.current = element;
        fieldRef?.(element);
        resize();
      }}
      rows={1}
      value={value}
      className={cn(
        'block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none',
        'placeholder:text-ink-4',
        className,
      )}
      {...rest}
    />
  );
}
