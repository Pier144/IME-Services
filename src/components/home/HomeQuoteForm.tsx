'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { FieldError } from '@/components/ui/Field';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { apiRoutes, routes } from '@/lib/routes';
import { quoteRequestSchema } from '@/lib/validation/schemas';
import { site, addressLine } from '@/lib/site';

/**
 * Il preventivo direttamente in home.
 *
 * È la versione corta del form dei soggetti personalizzati: qui servono solo i
 * campi per farsi richiamare, senza allegati, misure e tipologie. Chi ha una
 * richiesta precisa passa comunque dalla pagina dedicata, che resta.
 *
 * Stesso schema zod del server e stessa rotta: la richiesta finisce nella
 * stessa tabella delle altre, marcata `source: 'home'` così in area riservata
 * si vede da dove è arrivata.
 *
 * I campi sono pieni e senza bordo (`.campo-pieno`), al contrario di quelli
 * bordati del resto del sito: è la scelta che dà alla fascia il peso che ha nel
 * riferimento approvato dal cliente.
 */

type FormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  privacy: boolean;
  website: string;
};

export function HomeQuoteForm() {
  const { locale, t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(quoteRequestSchema(t.forms.errors)) as never,
    defaultValues: { name: '', company: '', email: '', phone: '', notes: '', privacy: false, website: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const response = await fetch(apiRoutes.quotes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale, source: 'home', subjects: [], attachments: [] }),
      });

      if (!response.ok) {
        setServerError(t.forms.errors.generic);
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      setServerError(t.forms.errors.generic);
    }
  });

  return (
    <section className="bg-panel-ime px-24 py-60 lg:px-46 lg:py-90">
      <div className="mx-auto grid max-w-1200 grid-cols-1 gap-46 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-90">
        <div>
          <Display as="h2" className="max-w-420 text-30 leading-112 font-semibold text-balance md:text-42">
            {t.home.quote.title}
          </Display>
          <p className="mt-24 font-body text-16 leading-165 font-medium text-ink">{t.home.quote.lead}</p>
          <p className="mt-10 max-w-460 font-body text-16 leading-170 text-ink-2">{t.home.quote.text}</p>

          <dl className="mt-36 flex flex-col gap-14 border-t border-hairline pt-26">
            {[
              [t.home.quote.phoneLabel, site.phone],
              [t.home.quote.emailLabel, site.email],
              [t.home.quote.workshopLabel, addressLine],
            ].map(([etichetta, valore]) => (
              <div key={etichetta} className="flex flex-wrap items-baseline gap-x-16">
                <dt className="w-84 flex-none font-body text-11 font-medium tracking-18 text-ink-3">
                  {etichetta}
                </dt>
                <dd className="font-body text-15 font-medium text-ink">{valore}</dd>
              </div>
            ))}
          </dl>
        </div>

        {submitted ? (
          <div className="flex flex-col justify-center border border-hairline px-24 py-40 md:px-36">
            <Display as="h3" className="text-24 md:text-28">
              {t.home.quote.successTitle}
            </Display>
            <p className="mt-14 max-w-460 font-body text-16 leading-170 text-ink-2">
              {t.home.quote.successText}
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-26 self-start border border-ghost px-26 py-12 font-body text-12 font-semibold tracking-18 text-gold transition-colors duration-200 hover:border-gold"
            >
              {t.home.quote.successAgain}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-12">
            {/* Campo esca: invisibile a chi legge, i robot lo compilano. */}
            <input
              {...register('website')}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div>
              <input
                {...register('name')}
                type="text"
                placeholder={t.home.quote.name}
                aria-label={t.home.quote.name}
                aria-invalid={errors.name ? 'true' : undefined}
                className="campo-pieno w-full px-18 py-15 font-body text-15"
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <input
              {...register('company')}
              type="text"
              placeholder={t.home.quote.company}
              aria-label={t.home.quote.company}
              className="campo-pieno w-full px-18 py-15 font-body text-15"
            />

            <div>
              <input
                {...register('email')}
                type="email"
                placeholder={t.home.quote.email}
                aria-label={t.home.quote.email}
                aria-invalid={errors.email ? 'true' : undefined}
                className="campo-pieno w-full px-18 py-15 font-body text-15"
              />
              <FieldError>{errors.email?.message}</FieldError>
            </div>

            <div>
              <input
                {...register('phone')}
                type="tel"
                placeholder={t.home.quote.phone}
                aria-label={t.home.quote.phone}
                aria-invalid={errors.phone ? 'true' : undefined}
                className="campo-pieno w-full px-18 py-15 font-body text-15"
              />
              <FieldError>{errors.phone?.message}</FieldError>
            </div>

            <textarea
              {...register('notes')}
              rows={5}
              placeholder={t.home.quote.message}
              aria-label={t.home.quote.message}
              className="campo-pieno w-full px-18 py-15 font-body text-15"
            />

            <div>
              <label className="mt-6 flex items-start gap-10 font-body text-14 leading-160 text-ink-2">
                <input
                  {...register('privacy')}
                  type="checkbox"
                  className="mt-3 size-15 flex-none accent-gold"
                  aria-invalid={errors.privacy ? 'true' : undefined}
                />
                <span>
                  {t.forms.privacy}{' '}
                  <Link
                    href={localePath(locale, routes.privacy)}
                    className="text-gold underline underline-offset-3 transition-colors duration-200 hover:text-gold-hover"
                  >
                    {t.forms.privacyLink}
                  </Link>
                </span>
              </label>
              <FieldError>{errors.privacy?.message}</FieldError>
            </div>

            {serverError && <FieldError>{serverError}</FieldError>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="hero-bottone mt-10 self-start bg-gold px-38 py-15 font-body text-12 font-semibold tracking-18 text-gold-ink disabled:opacity-60"
            >
              {isSubmitting ? t.home.quote.sending : t.home.quote.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
