'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';

/**
 * "+ NUOVO ARTICOLO": crea subito una bozza vuota e apre l'editor.
 * Così l'articolo ha un id fin dal primo istante e l'autosalvataggio può
 * partire senza casi particolari per "non ancora salvato".
 */
export function NewArticleButton({ size = 'admin' }: { size?: 'admin' | 'cta' }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    try {
      const response = await fetch(apiRoutes.articles, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', slug: '', status: 'draft' }),
      });
      if (!response.ok) return;
      const article = (await response.json()) as { id: string };
      router.push(adminRoutes.article(article.id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="gold" size={size} onClick={create} disabled={busy}>
      {t.admin.news.newArticle}
    </Button>
  );
}
