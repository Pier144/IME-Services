'use client';

import type { RefObject } from 'react';
import { useI18n } from '@/i18n/provider';

/**
 * Barra strumenti dell'area di scrittura (mockup 2j).
 *
 * Ogni comando scrive nel testo il marcatore corrispondente (gli stessi che
 * `textToBlocks` sa leggere) attorno alla selezione. Niente editor ricco:
 * il testo resta leggibile, versionabile e senza HTML da ripulire.
 */
export function EditorToolbar({
  textarea,
  onChange,
}: {
  textarea: RefObject<HTMLTextAreaElement | null>;
  onChange: (next: string) => void;
}) {
  const { t } = useI18n();

  function apply(transform: (selected: string) => string, { block = false } = {}) {
    const element = textarea.current;
    if (!element) return;

    const { selectionStart, selectionEnd, value } = element;
    const selected = value.slice(selectionStart, selectionEnd);
    const replacement = transform(selected);

    // I blocchi (titolo, citazione, elenco, immagine) vogliono una riga propria.
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const prefix = block && before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
    const suffix = block && after && !after.startsWith('\n\n') ? '\n\n' : '';

    const next = `${before}${prefix}${replacement}${suffix}${after}`;
    onChange(next);

    requestAnimationFrame(() => {
      element.focus();
      const caret = before.length + prefix.length + replacement.length;
      element.setSelectionRange(caret, caret);
    });
  }

  const buttons = [
    {
      key: 'bold',
      label: 'B',
      title: t.admin.editor.toolbar.bold,
      className: 'font-bold',
      run: () => apply((s) => `**${s || 'grassetto'}**`),
    },
    {
      key: 'italic',
      label: 'I',
      title: t.admin.editor.toolbar.italic,
      className: 'italic',
      run: () => apply((s) => `*${s || 'corsivo'}*`),
    },
    {
      key: 'underline',
      label: 'U',
      title: 'Sottolineato',
      className: 'underline',
      run: () => apply((s) => `__${s || 'sottolineato'}__`),
    },
    {
      key: 'heading',
      label: 'H2',
      title: t.admin.editor.toolbar.heading,
      className: '',
      run: () => apply((s) => `## ${s || 'Titolo di sezione'}`, { block: true }),
    },
    {
      key: 'quote',
      label: '“ ”',
      title: t.admin.editor.toolbar.quote,
      className: '',
      run: () => apply((s) => `> ${s || 'Citazione'}\n-- Attribuzione`, { block: true }),
    },
    {
      key: 'list',
      label: '≔',
      title: t.admin.editor.toolbar.list,
      className: '',
      run: () => apply((s) => (s ? s.split('\n').map((line) => `- ${line}`).join('\n') : '- Voce'), {
        block: true,
      }),
    },
    {
      key: 'link',
      label: '🔗',
      title: t.admin.editor.toolbar.link,
      className: '',
      run: () => {
        const href = window.prompt(t.admin.editor.linkPrompt, 'https://');
        if (!href) return;
        apply((s) => `[${s || 'testo del link'}](${href})`);
      },
    },
    {
      key: 'image',
      label: `▣ ${t.admin.editor.toolbar.image}`,
      title: t.admin.editor.toolbar.image,
      className: '',
      run: () => {
        const src = window.prompt(t.admin.editor.imagePrompt, '');
        const caption = window.prompt(t.admin.editor.imageCaptionPrompt, '') ?? '';
        apply(
          (s) =>
            `![${s || 'FOTO: descrivi la foto richiesta'}](${src ?? ''}${caption ? ` "${caption}"` : ''})`,
          { block: true },
        );
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-14 border-b border-rule-toolbar bg-toolbar-bg px-14 py-9 font-body text-13 text-ink-2">
      {buttons.map((button) => (
        <button
          key={button.key}
          type="button"
          onClick={button.run}
          title={button.title}
          className={`transition-colors duration-200 hover:text-gold ${button.className}`}
        >
          <span aria-hidden="true">{button.label}</span>
          <span className="sr-only">{button.title}</span>
        </button>
      ))}
    </div>
  );
}
