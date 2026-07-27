import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { LogoIme } from '@/components/brand/LogoIme';
import { Display } from '@/components/ui/Typography';
import { getDictionary } from '@/i18n';
import { defaultLocale, localePath } from '@/i18n/config';
import { adminRoutes, routes } from '@/lib/routes';
import { getSession } from '@/lib/auth';

export default async function LoginPage() {
  // Chi ha già una sessione non ha motivo di vedere il modulo.
  if (await getSession()) redirect(adminRoutes.news);

  const t = getDictionary(defaultLocale);

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg px-24 py-60">
      <div className="w-full max-w-380 border border-hairline bg-panel-ime px-24 py-34 md:px-40 md:py-40">
        <LogoIme size="admin" text={t.admin.brandLabel} />
        <Display as="h1" className="mt-24 text-24 md:text-28">
          {t.admin.login.title}
        </Display>

        <LoginForm />

        <Link
          href={localePath(defaultLocale, routes.home)}
          className="mt-24 inline-block font-body text-12-5 tracking-08 text-ink-3 transition-colors duration-200 hover:text-gold"
        >
          ← {t.admin.login.backToSite}
        </Link>
      </div>
    </main>
  );
}
