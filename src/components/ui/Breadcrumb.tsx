import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Crumb = { label: string; href?: string };

/**
 * Briciole di pane in maiuscoletto spaziato: .3em negli hero, .26em sulla
 * scheda soggetto. Il separatore è una barra, come nel mockup.
 */
export function Breadcrumb({
  items,
  tracking = '30',
  className,
}: {
  items: Crumb[];
  tracking?: '26' | '30';
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'font-body text-11 font-normal text-ink-3',
        tracking === '26' ? 'tracking-26' : 'tracking-30',
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
