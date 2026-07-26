import { cn } from '@/lib/utils';

/**
 * I gutter del design.
 *
 * README → "Larghezza pagina mockup 1200px; gutter laterale 90px
 * (header 40px; colonna di lettura articolo 210px)" e, nel responsive,
 * "gutter 90px → 24px".
 */
const gutters = {
  page: 'px-24 lg:px-90',
  header: 'px-24 lg:px-40',
  article: 'px-24 lg:px-210',
  admin: 'px-24 lg:px-34',
} as const;

export function Container({
  size = 'page',
  className,
  children,
  as: Tag = 'div',
}: {
  size?: keyof typeof gutters;
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article';
}) {
  return <Tag className={cn(gutters[size], className)}>{children}</Tag>;
}

export const gutterClass = gutters;
