import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { createArticle, uniqueSlug } from '@/lib/articles/repository';
import { textToBlocks } from '@/lib/articles/body';
import { articlePayloadSchema, isKnownCategory, publishBlockers } from '@/lib/validation/article';
import { fromDateInputValue } from '@/lib/dates';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

/** Crea un articolo (di norma una bozza vuota, dal pulsante "+ NUOVO ARTICOLO"). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const parsed = articlePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dati non validi.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  if (data.category && !isKnownCategory(data.category)) {
    return NextResponse.json({ error: 'Categoria sconosciuta.' }, { status: 422 });
  }

  if (data.status === 'published') {
    const missing = publishBlockers(data);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Per pubblicare mancano: ${missing.join(', ')}.` },
        { status: 422 },
      );
    }
  }

  const slug = await uniqueSlug(slugify(data.slug || data.title || 'nuovo-articolo'));

  const article = await createArticle({
    title: data.title,
    slug,
    excerpt: data.excerpt,
    body: textToBlocks(data.bodyText),
    category: data.category,
    coverImage: data.coverImage,
    coverAlt: data.coverAlt,
    tags: data.tags,
    status: data.status,
    featured: data.featured,
    publishedAt:
      data.status === 'published'
        ? (fromDateInputValue(data.publishedAt ?? '') ?? new Date())
        : fromDateInputValue(data.publishedAt ?? ''),
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  });

  if (article.status === 'published') {
    revalidatePath('/[locale]/news', 'page');
    revalidatePath('/[locale]', 'page');
  }

  return NextResponse.json(article, { status: 201 });
}
