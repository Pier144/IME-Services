import { z } from 'zod';
import { newsCategories } from '@/data/news-categories';
import { normalizeBody, parseBlock } from '@/lib/articles/body';

/**
 * Payload dell'editor.
 *
 * Il corpo viaggia come lista di blocchi — la stessa forma che il database
 * conserva e che la pagina pubblica rende — non più come testo con marcatori.
 * Un blocco malformato non viene scartato in silenzio: la richiesta è
 * rifiutata, perché scartarlo vorrebbe dire perdere un pezzo di articolo senza
 * dirlo a chi l'ha scritto.
 */

const categorySlugs = newsCategories.map((category) => category.slug);

/** Un articolo lunghissimo sta ampiamente sotto: è un tetto contro gli abusi. */
const maxBlocks = 500;

export const articlePayloadSchema = z.object({
  title: z.string().trim().max(200).default(''),
  slug: z.string().trim().max(90).default(''),
  excerpt: z.string().trim().max(600).default(''),
  body: z
    .array(z.unknown())
    .max(maxBlocks)
    .default([])
    .superRefine((blocks, ctx) => {
      blocks.forEach((block, index) => {
        if (parseBlock(block) !== null) return;
        ctx.addIssue({ code: 'custom', path: [index], message: 'Blocco del corpo non valido.' });
      });
    })
    // Normalizzare qui e non nella rotta significa che nessuna scrittura può
    // saltare il passaggio: la validazione è anche la porta.
    .transform(normalizeBody),
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
