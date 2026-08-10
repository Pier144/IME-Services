import { notFound } from 'next/navigation';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { requireSession } from '@/lib/auth';
import { getById, listUsedImages } from '@/lib/articles/repository';
import { toDateInputValue } from '@/lib/dates';

/** Area riservata · editor articolo a blocchi (mockup 3a). */
export default async function AdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const { id } = await params;
  const [article, usedImages] = await Promise.all([getById(id), listUsedImages()]);
  if (!article) notFound();

  return (
    <ArticleEditor
      usedImages={usedImages}
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        // Il corpo arriva all'editor nella forma in cui il database lo tiene.
        body: article.body,
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
