'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/provider';

/**
 * "CONDIVIDI · FACEBOOK · LINKEDIN · LINK" a fine articolo.
 * Il pulsante LINK copia l'indirizzo negli appunti e lo conferma sul posto,
 * senza aprire finestre di sistema.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Appunti non disponibili: l'indirizzo resta comunque nella barra.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-10 font-body text-11-5 tracking-10 text-ink-3 md:ml-auto">
      <span>{t.article.share}</span>
      <span aria-hidden="true">·</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors duration-200 hover:text-gold"
      >
        {t.article.shareFacebook}
        <span className="sr-only"> — {title}</span>
      </a>
      <span aria-hidden="true">·</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors duration-200 hover:text-gold"
      >
        {t.article.shareLinkedin}
      </a>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={copy}
        className="transition-colors duration-200 hover:text-gold"
      >
        {copied ? t.article.linkCopied : t.article.shareLink}
      </button>
    </div>
  );
}
