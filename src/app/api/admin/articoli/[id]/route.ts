import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { deleteArticle, getById, updateArticle, uniqueSlug } from '@/lib/articles/repository';
import { parseBlock, type BodyBlock } from '@/lib/articles/body';
import { articlePayloadSchema, isKnownCategory, publishBlockers } from '@/lib/validation/article';
import { fromDateInputValue } from '@/lib/dates';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

/** Rigenera le pagine pubbliche toccate da una modifica. */
function revalidateArticle(slug: string) {
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/news', 'page');
  revalidatePath(`/[locale]/news/${slug}`, 'page');
}

/** Salvataggio bozza, pubblicazione e ritorno in bozza passano tutti di qui. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 });

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

  const desiredSlug = slugify(data.slug || data.title || existing.slug);
  const slug =
    desiredSlug === existing.slug ? existing.slug : await uniqueSlug(desiredSlug, existing.id);

  const article = await updateArticle(existing.id, {
    title: data.title,
    slug,
    excerpt: data.excerpt,
    // Come nella creazione: `parseBlock` e' l'unica porta d'ingresso.
    body: data.body.map(parseBlock).filter((block): block is BodyBlock => block !== null),
    category: data.category,
    coverImage: data.coverImage,
    coverAlt: data.coverAlt,
    tags: data.tags,
    status: data.status,
    featured: data.featured,
    publishedAt:
      data.status === 'published'
        ? (fromDateInputValue(data.publishedAt ?? '') ?? existing.publishedAt ?? new Date())
        : fromDateInputValue(data.publishedAt ?? ''),
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  });

  // Se lo slug è cambiato, va rigenerato anche il vecchio indirizzo.
  revalidateArticle(article.slug);
  if (existing.slug !== article.slug) revalidateArticle(existing.slug);

  return NextResponse.json(article);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) return NextResponse.json({ error: 'Articolo non trovato.' }, { status: 404 });

  await deleteArticle(existing.id);
  revalidateArticle(existing.slug);

  return NextResponse.json({ ok: true });
}
