import { Fragment, type ReactNode } from 'react';

/**
 * Formattazione inline dei testi dell'articolo.
 *   **grassetto**  *corsivo*  __sottolineato__  [testo](https://…)
 *
 * Il testo non viene mai interpretato come markup: si spezza in token e si
 * costruiscono nodi React, quindi qualsiasi cosa scriva il redattore finisce
 * come testo o come uno dei tre tag consentiti.
 */

const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** Solo schemi sicuri: niente `javascript:` e simili. */
function safeHref(href: string): string | null {
  const value = href.trim();
  if (value.startsWith('/') || value.startsWith('#')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^mailto:/i.test(value) || /^tel:/i.test(value)) return value;
  return null;
}

export function renderInline(text: string): ReactNode[] {
  const parts = text.split(TOKEN).filter((part) => part !== '');

  return parts.map((part, index) => {
    const key = `${index}-${part.slice(0, 8)}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <u key={key} className="underline underline-offset-4">
          {part.slice(2, -2)}
        </u>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    const link = part.match(LINK);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <Fragment key={key}>{link[1]}</Fragment>;
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      );
    }

    return <Fragment key={key}>{part}</Fragment>;
  });
}
