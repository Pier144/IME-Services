import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

/**
 * Briciole di pane in maiuscoletto spaziato: .16em negli hero, .18em sulla
 * scheda soggetto. Il separatore è una barra, come nel mockup.
 */
export function Breadcrumb({
  items,
  tracking = '16',
  className,
}: {
  items: Crumb[];
  tracking?: '16' | '18';
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'font-body text-11-5 font-medium text-ink-3',
        tracking === '18' ? 'tracking-18' : 'tracking-16',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-8">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-8">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors duration-200 ease-out hover:text-gold"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
