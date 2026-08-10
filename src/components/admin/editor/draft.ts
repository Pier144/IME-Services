import type { BodyBlock } from '@/lib/articles/body';

/**
 * L'articolo come lo tiene l'editor mentre lo si scrive.
 *
 * Sta in un file suo perché lo condividono la schermata e il pannello
 * Impostazioni: il pannello ne modifica una fetta (`PanelDraft`), e derivarla
 * con `Pick` da qui è ciò che permette di passargli la stessa funzione di
 * aggiornamento senza forzature di tipo.
 */
export type EditorArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: BodyBlock[];
  category: string;
  coverImage: string | null;
  coverAlt: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};
