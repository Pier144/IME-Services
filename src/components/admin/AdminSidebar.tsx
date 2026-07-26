'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoIme } from '@/components/brand/LogoIme';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Sidebar dell'area riservata (mockup 2i).
 *
 * Sotto i 900px diventa una striscia orizzontale scorrevole invece di
 * collassare a icone come suggerisce il README: il design non ha un set di
 * icone ("le icone sono praticamente assenti per scelta") e inventarne uno
 * avrebbe introdotto un linguaggio estraneo. Da confermare con il designer.
 */
export function AdminSidebar({ email }: { email: string }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { href: `${adminRoutes.root}/dashboard`, label: t.admin.nav.dashboard },
    { href: adminRoutes.news, label: t.admin.nav.news },
    { href: `${adminRoutes.root}/soggetti`, label: t.admin.nav.subjects },
    { href: `${adminRoutes.root}/preventivi`, label: t.admin.nav.quotes },
    { href: `${adminRoutes.root}/candidature`, label: t.admin.nav.applications },
    { href: `${adminRoutes.root}/media`, label: t.admin.nav.media },
    { href: `${adminRoutes.root}/impostazioni`, label: t.admin.nav.settings },
  ];

  async function signOut() {
    await fetch(apiRoutes.logout, { method: 'POST' });
    router.replace(adminRoutes.login);
    router.refresh();
  }

  return (
    <div className="flex flex-none flex-col border-b border-hairline bg-admin-bg md:w-230 md:border-r md:border-b-0 md:py-22">
      <div className="flex items-center gap-9 border-hairline px-22 py-16 md:border-b md:pt-0 md:pb-20">
        <LogoIme size="admin" text={t.admin.brandLabel} />
      </div>

      <nav
        aria-label={t.admin.brandLabel}
        className="flex overflow-x-auto font-body text-13-5 text-ink-3 md:mt-18 md:flex-col md:overflow-visible"
      >
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex-none px-22 py-12 whitespace-nowrap transition-colors duration-200 ease-out hover:text-gold',
                active && 'bg-gold-rail text-gold shadow-rail-active',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-hairline px-22 pt-18 font-body text-12-5 leading-150 font-light text-ink-4 md:mt-auto md:block">
        {t.admin.signedInAs}
        <br />
        <span className="text-ink-2">{email}</span>
        <br />
        <button
          type="button"
          onClick={signOut}
          className="mt-4 text-gold transition-colors duration-200 hover:text-gold-hover"
        >
          {t.admin.signOut}
        </button>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="border-t border-hairline px-22 py-12 text-left font-body text-12-5 text-gold md:hidden"
      >
        {t.admin.signOut}
      </button>
    </div>
  );
}
