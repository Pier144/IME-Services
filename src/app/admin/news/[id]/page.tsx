import { notFound } from 'next/navigation';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { requireSession } from '@/lib/auth';
import { getById } from '@/lib/articles/repository';
import { blocksToText } from '@/lib/articles/body';
import { toDateInputValue } from '@/lib/dates';

/** Area riservata · editor articolo con anteprima live (mockup 2j). */
export default async function AdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const { id } = await params;
  const article = await getById(id);
  if (!article) notFound();

  return (
    <ArticleEditor
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        // Il corpo torna al redattore nella stessa forma in cui l'ha scritto.
        bodyText: blocksToText(article.body),
        category: article.category,
        coverImage: article.coverImage,
        coverAlt: article.coverAlt,
        tags: article.tags,
        status: article.status,
        featured: article.featured,
        publishedAt: toDateInputValue(article.publishedAt),
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        updatedAt: article.updatedAt.toISOString(),
      }}
    />
  );
}
