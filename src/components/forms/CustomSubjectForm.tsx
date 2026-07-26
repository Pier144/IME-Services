'use client';

import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Dropzone } from './Dropzone';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, FieldError, Input, Select, Textarea } from '@/components/ui/Field';
import { Tag } from '@/components/ui/Chip';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { apiRoutes, routes } from '@/lib/routes';
import { useQuoteRequest, type RequestItem } from '@/lib/request-context';
import type { StoredFile } from '@/lib/storage/types';
import { quoteRequestSchema } from '@/lib/validation/schemas';

type FormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  subjectType: string;
  quantity: string;
  dimensions: string;
  usage: string;
  notes: string;
  privacy: boolean;
  website: string;
};

/**
 * Form dei soggetti personalizzati (mockup 2c).
 *
 * Validazione al blur e al submit con react-hook-form + zod, stessi schemi del
 * server. A invio riuscito il form viene sostituito da un messaggio: nessun
 * alert, come chiede il design.
 */
export function CustomSubjectForm({ catalog }: { catalog: RequestItem[] }) {
  const { locale, t } = useI18n();
  const { items, remove, clear, add, ready } = useQuoteRequest();
  const [attachments, setAttachments] = useState<StoredFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const uid = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(quoteRequestSchema(t.forms.errors)) as never,
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      subjectType: '',
      quantity: '',
      dimensions: '',
      usage: '',
      notes: '',
      privacy: false,
      website: '',
    },
  });

  /**
   * "RICHIEDI PREVENTIVO" dalla scheda soggetto arriva qui con `?soggetto=slug`.
   * Si legge dopo l'idratazione, così la pagina resta generata staticamente.
   */
  useEffect(() => {
    if (!ready) return;
    const slug = new URLSearchParams(window.location.search).get('soggetto');
    if (!slug) return;
    const subject = catalog.find((item) => item.slug === slug);
    if (subject) add(subject);
  }, [ready, catalog, add]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const response = await fetch(apiRoutes.quotes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          locale,
          source: 'soggetti-personalizzati',
          subjects: items.map((item) => item.slug),
          attachments,
        }),
      });

      if (!response.ok) {
        setServerError(t.forms.errors.generic);
        return;
      }

      setSubmitted(true);
      setAttachments([]);
      clear();
      reset();
    } catch {
      setServerError(t.forms.errors.generic);
    }
  });

  if (submitted) {
    return (
      <div className="flex-1 border border-hairline bg-panel-ime px-24 py-40 md:px-44">
        <Display as="h2" className="text-24 md:text-28">
          {t.custom.form.successTitle}
        </Display>
        <p className="mt-14 max-w-520 font-body text-15-5 leading-170 font-light text-ink-2">
          {t.custom.form.successText}
        </p>
        <Button variant="ghostGold" size="compact" className="mt-24" onClick={() => setSubmitted(false)}>
          {t.custom.form.successAgain}
        </Button>
      </div>
    );
  }

  return (
    <form
      id="richiesta"
      noValidate
      onSubmit={onSubmit}
      className="flex-1 border border-hairline bg-panel-ime px-24 py-34 md:px-44 md:py-40"
    >
      <Display as="h2" className="text-24 md:text-28">
        {t.custom.form.title}
      </Display>
      <p className="mt-8 font-body text-14 font-light text-ink-3">{t.custom.form.subtitle}</p>

      {/* Soggetti arrivati dalla richiesta multipla */}
      {ready && items.length > 0 && (
        <div className="mt-24 border border-hairline bg-field-bg px-18 py-16">
          <p className="font-body text-11 tracking-10 text-ink-3">
            {t.custom.form.selectedSubjects}
          </p>
          <ul className="mt-10 flex flex-wrap gap-8">
            {items.map((item) => (
              <li key={item.slug}>
                <Tag onRemove={() => remove(item.slug)} removeLabel={t.subject.removeFromRequest}>
                  {item.name}
                </Tag>
              </li>
            ))}
          </ul>
          <p className="mt-10 font-body text-12 font-light text-ink-4">
            {t.custom.form.selectedSubjectsHint}
          </p>
        </div>
      )}

      <div className="mt-28 grid grid-cols-1 gap-18 sm:grid-cols-2">
        <Field
          label={t.forms.labels.name}
          htmlFor={`${uid}-name`}
          required
          requiredHint={t.common.required}
          error={errors.name?.message}
        >
          <Input
            id={`${uid}-name`}
            autoComplete="name"
            placeholder={t.forms.placeholders.name}
            invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            {...register('name')}
          />
        </Field>

        <Field label={t.forms.labels.company} htmlFor={`${uid}-company`} error={errors.company?.message}>
          <Input
            id={`${uid}-company`}
            autoComplete="organization"
            placeholder={t.forms.placeholders.company}
            invalid={Boolean(errors.company)}
            {...register('company')}
          />
        </Field>

        <Field
          label={t.forms.labels.email}
          htmlFor={`${uid}-email`}
          required
          requiredHint={t.common.required}
          error={errors.email?.message}
        >
          <Input
            id={`${uid}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t.forms.placeholders.email}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            {...register('email')}
          />
        </Field>

        <Field label={t.forms.labels.phone} htmlFor={`${uid}-phone`} error={errors.phone?.message}>
          <Input
            id={`${uid}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t.forms.placeholders.phone}
            invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
        </Field>

        <Field label={t.forms.labels.subjectType} htmlFor={`${uid}-type`}>
          <Select id={`${uid}-type`} defaultValue="" {...register('subjectType')}>
            <option value="">{t.forms.placeholders.choose}</option>
            {t.forms.subjectTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t.forms.labels.quantity} htmlFor={`${uid}-quantity`}>
          <Input
            id={`${uid}-quantity`}
            inputMode="numeric"
            placeholder={t.forms.placeholders.quantity}
            {...register('quantity')}
          />
        </Field>

        <Field label={t.forms.labels.dimensions} htmlFor={`${uid}-dimensions`}>
          <Input
            id={`${uid}-dimensions`}
            placeholder={t.forms.placeholders.dimensions}
            {...register('dimensions')}
          />
        </Field>

        <Field label={t.forms.labels.usage} htmlFor={`${uid}-usage`}>
          <Select id={`${uid}-usage`} defaultValue="" {...register('usage')}>
            <option value="">{t.forms.placeholders.choose}</option>
            {t.forms.usages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-20">
        <p id={`${uid}-drawing-label`} className="mb-7 font-body text-11 tracking-10 text-ink-3">
          {t.forms.labels.drawing}
        </p>
        <Dropzone
          id={`${uid}-drawing`}
          kind="attachment"
          label={t.forms.labels.drawing}
          multiple
          files={attachments}
          onChange={setAttachments}
          describedBy={`${uid}-drawing-label`}
        />
      </div>

      <Field label={t.forms.labels.notes} htmlFor={`${uid}-notes`} className="mt-20" error={errors.notes?.message}>
        <Textarea
          id={`${uid}-notes`}
          className="h-76"
          placeholder={t.forms.placeholders.notes}
          invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
      </Field>

      {/* Campo esca invisibile: se arriva compilato, la richiesta è di un robot. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${uid}-website`}>Sito web</label>
        <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="mt-20">
        <Checkbox id={`${uid}-privacy`} invalid={Boolean(errors.privacy)} {...register('privacy')}>
          {t.forms.privacy}{' '}
          <Link
            href={localePath(locale, routes.privacy)}
            className="text-gold underline underline-offset-2 hover:text-gold-hover"
          >
            {t.forms.privacyLink}
          </Link>
        </Checkbox>
        <FieldError>{errors.privacy?.message}</FieldError>
      </div>

      {serverError && (
        <p role="alert" className="mt-16 border border-red px-14 py-10 font-body text-13 text-red">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="gold" size="form" className="mt-24" disabled={isSubmitting}>
        {isSubmitting ? t.custom.form.sending : t.custom.form.submit}
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </Button>
    </form>
  );
}
