import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import {
  bulkDelete,
  bulkUpdate,
  createArticle,
  listByIds,
  uniqueSlug,
} from '@/lib/articles/repository';
import { articlePayloadSchema, isKnownCategory, publishBlockers } from '@/lib/validation/article';
import { fromDateInputValue } from '@/lib/dates';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

/**
 * Rigenera le pagine toccate da un'operazione su più articoli.
 *
 * Le due pagine di elenco si rigenerano una volta sola, non una per articolo;
 * le pagine dei singoli articoli vanno però nominate a una a una, altrimenti
 * resterebbero servite dalla cache con il contenuto vecchio.
 */
function revalidateMany(slugs: string[]) {
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/news', 'page');
  for (const slug of new Set(slugs)) revalidatePath(`/[locale]/news/${slug}`, 'page');
}

/** Corpo delle operazioni multiple: al massimo cento per richiesta. */
const bulkSchema = z.object({
  ids: z.array(z.string().min(1).max(40)).min(1).max(100),
  status: z.enum(['draft', 'published']).optional(),
  category: z.string().trim().max(60).optional(),
});

async function readBulk(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return { error: NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 }) };
  }

  const parsed = bulkSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: NextResponse.json({ error: 'Dati non validi.' }, { status: 422 }) };
  }

  return { data: parsed.data };
}

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
    body: data.body,
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

/**
 * Cambio di stato o categoria su più articoli (barra delle azioni della lista).
 *
 * La validazione è la stessa della rotta singola, e viene applicata a ogni
 * articolo: se anche uno solo non è pubblicabile l'operazione non parte. È
 * voluto — pubblicarne otto su dieci e tacere sui due mancanti lascerebbe chi
 * scrive convinto di aver pubblicato tutto.
 */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });

  const read = await readBulk(request);
  if (read.error) return read.error;
  const { ids, status, category } = read.data;

  if (!status && !category) {
    return NextResponse.json({ error: 'Nessuna modifica richiesta.' }, { status: 422 });
  }

  if (category && !isKnownCategory(category)) {
    return NextResponse.json({ error: 'Categoria sconosciuta.' }, { status: 422 });
  }

  const articles = await listByIds(ids);
  if (articles.length === 0) {
    return NextResponse.json({ error: 'Nessun articolo trovato.' }, { status: 404 });
  }

  if (status === 'published') {
    const incompleti = articles
      // Se si sta cambiando anche la categoria, la validazione deve guardare
      // quella nuova: è la stessa che verrà salvata un attimo dopo.
      .map((article) => ({
        article,
        missing: publishBlockers({ ...article, category: category ?? article.category }),
      }))
      .filter((riga) => riga.missing.length > 0);

    if (incompleti.length > 0) {
      const elenco = incompleti
        .map((riga) => `"${riga.article.title || 'senza titolo'}" (${riga.missing.join(', ')})`)
        .join('; ');
      return NextResponse.json(
        { error: `Non si possono pubblicare: ${elenco}.` },
        { status: 422 },
      );
    }
  }

  await bulkUpdate(ids, { status, category });
  revalidateMany(articles.map((article) => article.slug));

  return NextResponse.json({ ok: true, count: articles.length });
}

/** Eliminazione di più articoli. */
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Accesso richiesto.' }, { status: 401 });

  const read = await readBulk(request);
  if (read.error) return read.error;

  const articles = await listByIds(read.data.ids);
  if (articles.length === 0) {
    return NextResponse.json({ error: 'Nessun articolo trovato.' }, { status: 404 });
  }

  await bulkDelete(articles.map((article) => article.id));
  revalidateMany(articles.map((article) => article.slug));

  return NextResponse.json({ ok: true, count: articles.length });
}
