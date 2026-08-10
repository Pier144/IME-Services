'use client';

import { useCallback, useEffect, useRef } from 'react';
import { focusKey, type FocusTarget } from '@/lib/articles/editor-blocks';

type Field = HTMLTextAreaElement | HTMLInputElement;

/**
 * Il fuoco della tastiera fra i blocchi.
 *
 * Le operazioni sui blocchi dicono *dove* deve andare il cursore, ma il campo
 * che lo riceverà non esiste ancora nel momento in cui lo dicono: viene creato
 * dal rendering successivo. Qui la richiesta viene messa da parte e onorata
 * appena il campo si presenta.
 */
export function useBlockFocus() {
  const fields = useRef(new Map<string, Field>());
  const pending = useRef<string | null>(null);

  const register = useCallback(
    (key: string) => (element: Field | null) => {
      if (element) fields.current.set(key, element);
      else fields.current.delete(key);
    },
    [],
  );

  const getField = useCallback((key: string) => fields.current.get(key) ?? null, []);

  const request = useCallback((target: FocusTarget | null) => {
    if (target) pending.current = focusKey(target);
  }, []);

  useEffect(() => {
    const key = pending.current;
    if (!key) return;

    const field = fields.current.get(key);
    if (!field) return;

    pending.current = null;
    field.focus();
    // In fondo al testo, non all'inizio: si riprende a scrivere da dove si era.
    const end = field.value.length;
    field.setSelectionRange(end, end);
  });

  return { register, getField, request };
}
