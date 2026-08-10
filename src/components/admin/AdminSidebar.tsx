'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoIme } from '@/components/brand/LogoIme';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Barra laterale dell'area riservata (handoff 6a).
 *
 * Le voci sono raggruppate — CONTENUTI, RICHIESTE, SISTEMA — ma **si mostrano
 * solo i gruppi che hanno voci vive**. L'handoff disegna sei voci e due righe
 * dopo dice che «una voce senza pagina va tolta, non lasciata morta»: oggi
 * esiste solo News, quindi si vede un gruppo solo. Quando nasceranno le altre
 * pagine basta aggiungerle qui sotto e il gruppo ricompare da sé.
 *
 * Il perché della regola: chi entra la prima volta e trova sei voci su sette
 * che portano a un 404 conclude che lo strumento è guasto, non che è incompleto.
 *
 * Sotto i 900px diventa una striscia orizzontale scorrevole invece di
 * collassare a icone: il design dichiara che le icone sono assenti per scelta,
 * e inventarne un set avrebbe introdotto un linguaggio estraneo.
 */

type Voce = {
  href: string;
  label: string;
  /** Numero a destra: articoli, richieste da leggere… */
  count?: number;
  /** Richieste non lette: pastiglia oro invece del numero grigio. */
  urgent?: boolean;
};

export function AdminSidebar({
  email,
  articleCount,
}: {
  email: string;
  articleCount?: number;
}) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const gruppi: Array<{ titolo: string; voci: Voce[] }> = [
    {
      titolo: t.admin.nav.groups.content,
      voci: [{ href: adminRoutes.news, label: t.admin.nav.news, count: articleCount }],
    },
    // RICHIESTE (preventivi, candidature) e SISTEMA (impostazioni) tornano
    // quando le rispettive pagine esistono.
  ];

  async function signOut() {
    await fetch(apiRoutes.logout, { method: 'POST' });
    router.replace(adminRoutes.login);
    router.refresh();
  }

  return (
    <div className="flex flex-none flex-col border-b border-hairline bg-admin-bg md:w-250 md:border-r md:border-b-0 md:py-22">
      <div className="flex items-center gap-9 border-hairline px-22 py-16 md:border-b md:pt-0 md:pb-20">
        <LogoIme size="admin" text={t.admin.brandLabel} />
      </div>

      <nav
        aria-label={t.admin.brandLabel}
        className="flex overflow-x-auto font-body text-13-5 text-ink-3 md:flex-col md:overflow-visible"
      >
        {gruppi.map((gruppo, indice) => (
          <div key={gruppo.titolo} className="contents md:block">
            <p
              className={cn(
                'hidden px-22 pb-8 text-9 font-medium tracking-20 text-ink-4 md:block',
                indice > 0 && 'pt-22',
              )}
            >
              {gruppo.titolo}
            </p>

            {gruppo.voci.map((voce) => {
              const attiva = pathname === voce.href || pathname.startsWith(`${voce.href}/`);
              return (
                <Link
                  key={voce.href}
                  href={voce.href}
                  aria-current={attiva ? 'page' : undefined}
                  className={cn(
                    'flex flex-none items-center justify-between gap-12 px-22 py-11 whitespace-nowrap',
                    'transition-colors duration-200 ease-out hover:text-gold',
                    attiva && 'bg-gold-rail text-gold shadow-rail-active',
                  )}
                >
                  <span>{voce.label}</span>
                  {voce.count !== undefined &&
                    (voce.urgent ? (
                      <span className="rounded-pill bg-gold px-8 py-1 text-11 font-semibold text-gold-ink">
                        {voce.count}
                      </span>
                    ) : (
                      <span className={attiva ? 'text-ink-3' : 'text-ink-4'}>{voce.count}</span>
                    ))}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-hairline px-22 pt-18 font-body text-12-5 leading-170 font-medium text-ink-4 md:mt-auto md:block">
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
