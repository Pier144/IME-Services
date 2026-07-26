import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Display, Eyebrow } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { defaultLocale, localePath } from '@/i18n/config';
import { routes } from '@/lib/routes';

/**
 * 404 del sito pubblico.
 * Next non passa i parametri di rotta a `not-found`, quindi la pagina è in
 * italiano: è la lingua di default e l'unica certa quando l'indirizzo è ignoto.
 */
export default function NotFound() {
  const t = getDictionary(defaultLocale);

  return (
    <Container className="py-70 lg:py-100">
      <Eyebrow tone="gold" size="sm" tracking="30">
        {t.notFound.eyebrow}
      </Eyebrow>
      <Display as="h1" className="mt-14 max-w-640 text-32 leading-110 md:text-46">
        {t.notFound.title}
      </Display>
      <p className="mt-16 max-w-520 font-body text-16 leading-170 font-light text-ink-2">
        {t.notFound.text}
      </p>
      <div className="mt-30 flex flex-wrap gap-14">
        <ButtonLink href={localePath(defaultLocale, routes.home)} variant="gold" size="ctaSm">
          {t.notFound.home}
        </ButtonLink>
        <ButtonLink href={localePath(defaultLocale, routes.luminarie)} variant="ghost" size="ctaSm">
          {t.notFound.catalog}
        </ButtonLink>
      </div>
    </Container>
  );
}
