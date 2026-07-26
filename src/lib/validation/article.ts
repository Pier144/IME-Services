import { z } from 'zod';
import { newsCategories } from '@/data/news-categories';

/**
 * Payload dell'editor.
 *
 * Il corpo viaggia come testo (la stessa cosa che il redattore ha davanti) e
 * viene trasformato in blocchi da `textToBlocks`, sia nell'anteprima sia sul
 * server: una funzione sola, nessuna possibilità che anteprima e pagina
 * pubblicata divergano.
 */

const categorySlugs = newsCategories.map((category) => category.slug);

export const articlePayloadSchema = z.object({
  title: z.string().trim().max(200).default(''),
  slug: z.string().trim().max(90).default(''),
  excerpt: z.string().trim().max(600).default(''),
  bodyText: z.string().max(60_000).default(''),
  category: z.string().trim().max(60).default(''),
  coverImage: z.string().max(500).nullable().default(null),
  coverAlt: z.string().trim().max(300).default(''),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  /** "2025-12-12" oppure null. */
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .default(null),
  seoTitle: z.string().trim().max(200).default(''),
  seoDescription: z.string().trim().max(400).default(''),
});

export type ArticlePayload = z.infer<typeof articlePayloadSchema>;

/**
 * Requisiti per pubblicare (README, mockup 2j):
 * PUBBLICA è bloccato finché mancano titolo, categoria, copertina o sommario.
 * Il controllo sta qui perché deve valere anche se la richiesta arriva
 * scavalcando l'interfaccia.
 */
export function publishBlockers(payload: {
  title: string;
  category: string;
  coverImage: string | null;
  excerpt: string;
}): string[] {
  const missing: string[] = [];
  if (!payload.title.trim()) missing.push('titolo');
  if (!payload.category.trim()) missing.push('categoria');
  if (!payload.coverImage) missing.push('copertina');
  if (!payload.excerpt.trim()) missing.push('sommario');
  return missing;
}

export function isKnownCategory(slug: string): boolean {
  return categorySlugs.includes(slug);
}
