import 'server-only';
import type { Article as ArticleRow, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { parseBody, readingMinutes, serializeBody, type BodyBlock } from './body';

/**
 * Unico punto di accesso agli articoli.
 *
 * Tutta l'applicazione parla con queste funzioni, mai con Prisma direttamente:
 * se domani il CMS diventa Sanity o Payload si riscrive solo questo file.
 */

export type ArticleStatus = 'draft' | 'published';

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: BodyBlock[];
  category: string;
  coverImage: string | null;
  coverAlt: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
  /** Calcolato dal corpo: "4 MIN DI LETTURA". */
  readingMinutes: number;
};

export type ArticleInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: BodyBlock[];
  category: string;
  coverImage: string | null;
  coverAlt: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
};

function parseTags(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    return [];
  }
}

function toArticle(row: ArticleRow): Article {
  const body = parseBody(row.body);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body,
    category: row.category,
    coverImage: row.coverImage,
    coverAlt: row.coverAlt,
    tags: parseTags(row.tags),
    status: row.status === 'published' ? 'published' : 'draft',
    featured: row.featured,
    publishedAt: row.publishedAt,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    readingMinutes: readingMinutes(body),
  };
}

function toRow(input: ArticleInput): Prisma.ArticleUncheckedCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body: serializeBody(input.body),
    category: input.category,
    coverImage: input.coverImage,
    coverAlt: input.coverAlt,
    tags: JSON.stringify(input.tags),
    status: input.status,
    featured: input.featured,
    publishedAt: input.publishedAt,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };
}

/* --------------------------------------------------------------------------
 * Lettura pubblica
 * ----------------------------------------------------------------------- */

/** Articoli pubblicati, dal più recente. Filtro categoria facoltativo. */
export async function listPublished(options: { category?: string } = {}): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: {
      status: 'published',
      ...(options.category ? { category: options.category } : {}),
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
  return rows.map(toArticle);
}

/** L'articolo in evidenza: il più recente con `featured`, altrimenti il primo. */
export async function getFeatured(category?: string): Promise<Article | null> {
  const rows = await prisma.article.findMany({
    where: { status: 'published', featured: true, ...(category ? { category } : {}) },
    orderBy: [{ publishedAt: 'desc' }],
    take: 1,
  });
  if (rows.length > 0) return toArticle(rows[0]);

  const fallback = await prisma.article.findFirst({
    where: { status: 'published', ...(category ? { category } : {}) },
    orderBy: [{ publishedAt: 'desc' }],
  });
  return fallback ? toArticle(fallback) : null;
}

export async function getPublishedBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findFirst({ where: { slug, status: 'published' } });
  return row ? toArticle(row) : null;
}

/** Articolo precedente e successivo in ordine di pubblicazione. */
export async function getNeighbours(article: Article) {
  const [previous, next] = await Promise.all([
    prisma.article.findFirst({
      where: {
        status: 'published',
        publishedAt: { lt: article.publishedAt ?? article.createdAt },
      },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.article.findFirst({
      where: {
        status: 'published',
        publishedAt: { gt: article.publishedAt ?? article.createdAt },
      },
      orderBy: { publishedAt: 'asc' },
    }),
  ]);

  return {
    previous: previous ? toArticle(previous) : null,
    next: next ? toArticle(next) : null,
  };
}

/** Gli ultimi N articoli pubblicati: serve alla home. */
export async function listLatest(take: number): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take,
  });
  return rows.map(toArticle);
}

export async function listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  });
}

/* --------------------------------------------------------------------------
 * Area riservata
 * ----------------------------------------------------------------------- */

export type AdminListOptions = {
  query?: string;
  status?: ArticleStatus | 'all';
  /** Slug di categoria, vedi src/data/news-categories.ts. */
  category?: string;
  /** Anno di pubblicazione. Gli articoli senza data non compaiono se filtrato. */
  year?: number;
};

/**
 * Elenco per l'area riservata: data decrescente con le bozze in cima,
 * come chiesto dal README.
 */
export async function listForAdmin(options: AdminListOptions = {}): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: {
      ...(options.status && options.status !== 'all' ? { status: options.status } : {}),
      // `mode: 'insensitive'` è indispensabile su Postgres: a differenza di
      // SQLite, `contains` distingue maiuscole e minuscole, e senza questo
      // cercare "natale" non troverebbe "Natale".
      ...(options.query
        ? { title: { contains: options.query, mode: 'insensitive' as const } }
        : {}),
      ...(options.category ? { category: options.category } : {}),
      // Intervallo invece di estrarre l'anno con una funzione SQL: così
      // l'indice su publishedAt resta utilizzabile.
      ...(options.year
        ? {
            publishedAt: {
              gte: new Date(Date.UTC(options.year, 0, 1)),
              lt: new Date(Date.UTC(options.year + 1, 0, 1)),
            },
          }
        : {}),
    },
    orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
  });
  return rows.map(toArticle);
}

/** Gli anni presenti fra gli articoli, decrescenti: alimenta il filtro. */
export async function publishedYears(): Promise<number[]> {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    select: { publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  });
  const anni = new Set<number>();
  for (const row of rows) if (row.publishedAt) anni.add(row.publishedAt.getUTCFullYear());
  return [...anni];
}

export async function countByStatus() {
  const [total, published, drafts] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'draft' } }),
  ]);
  return { total, published, drafts };
}

export async function getById(id: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { id } });
  return row ? toArticle(row) : null;
}

/** Slug unico: se è già preso aggiunge -2, -3, … */
export async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const candidate = base || 'articolo';
  let slug = candidate;
  let suffix = 2;

  for (;;) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${candidate}-${suffix}`;
    suffix += 1;
  }
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const row = await prisma.article.create({ data: toRow(input) });
  return toArticle(row);
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article> {
  const row = await prisma.article.update({ where: { id }, data: toRow(input) });
  return toArticle(row);
}

export async function deleteArticle(id: string): Promise<void> {
  await prisma.article.delete({ where: { id } });
}

/* --------------------------------------------------------------------------
 * Operazioni su più articoli (selezione multipla della lista)
 * ----------------------------------------------------------------------- */

export async function listByIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.article.findMany({ where: { id: { in: ids } } });
  return rows.map(toArticle);
}

/**
 * Cambia stato e/o categoria di più articoli in una transazione sola.
 *
 * Non è `updateMany`: pubblicare richiede una decisione per riga — chi non ha
 * mai avuto una data di pubblicazione la riceve adesso, chi ce l'ha se la
 * tiene — e `updateMany` non sa fare scelte diverse riga per riga.
 */
export async function bulkUpdate(
  ids: string[],
  changes: { status?: ArticleStatus; category?: string },
): Promise<void> {
  if (ids.length === 0) return;
  const existing = await listByIds(ids);
  const now = new Date();

  await prisma.$transaction(
    existing.map((article) =>
      prisma.article.update({
        where: { id: article.id },
        data: {
          ...(changes.category ? { category: changes.category } : {}),
          ...(changes.status
            ? {
                status: changes.status,
                publishedAt:
                  changes.status === 'published'
                    ? (article.publishedAt ?? now)
                    : article.publishedAt,
              }
            : {}),
        },
      }),
    ),
  );
}

export async function bulkDelete(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.article.deleteMany({ where: { id: { in: ids } } });
}
