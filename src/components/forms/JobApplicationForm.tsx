'use client';

import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Dropzone } from './Dropzone';
import { Button } from '@/components/ui/Button';
import { Checkbox, Field, FieldError, Input, Select, Textarea } from '@/components/ui/Field';
import { Display } from '@/components/ui/Typography';
import { useI18n } from '@/i18n/provider';
import { localePath } from '@/i18n/config';
import { apiRoutes, routes } from '@/lib/routes';
import type { StoredFile } from '@/lib/storage/types';
import { jobApplicationSchema } from '@/lib/validation/schemas';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  role: string;
  about: string;
  privacy: boolean;
  website: string;
};

/**
 * Candidatura (mockup 2h).
 * Il pulsante "CANDIDATI →" di una posizione porta qui con `?ruolo=slug`:
 * il ruolo arriva già selezionato.
 */
export function JobApplicationForm({
  positions,
}: {
  positions: readonly { slug: string; title: string }[];
}) {
  const { locale, t } = useI18n();
  const [cv, setCv] = useState<StoredFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const uid = useId();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: 'onBlur',
    resolver: zodResolver(jobApplicationSchema(t.forms.errors)) as never,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      role: '',
      about: '',
      privacy: false,
      website: '',
    },
  });

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get('ruolo');
    if (role && positions.some((position) => position.slug === role)) {
      setValue('role', role);
    }
  }, [positions, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    // Il curriculum è obbligatorio ma vive fuori da react-hook-form.
    if (cv.length === 0) {
      setError('root', { message: t.forms.errors.cvRequired });
      return;
    }
    clearErrors('root');

    try {
      const response = await fetch(apiRoutes.applications, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          role:
            positions.find((position) => position.slug === values.role)?.title ??
            t.careers.form.spontaneous,
          locale,
          cv: cv[0],
        }),
      });

      if (!response.ok) {
        setServerError(t.forms.errors.generic);
        return;
      }

      setSubmitted(true);
      setCv([]);
      reset();
    } catch {
      setServerError(t.forms.errors.generic);
    }
  });

  if (submitted) {
    return (
      <div className="flex-1 border border-hairline bg-panel-ime px-24 py-40 md:px-42">
        <Display as="h2" className="text-24 md:text-28">
          {t.careers.form.successTitle}
        </Display>
        <p className="mt-14 font-body text-16 leading-170 text-ink-2">
          {t.careers.form.successText}
        </p>
      </div>
    );
  }

  return (
    <form
      id="candidatura"
      noValidate
      onSubmit={onSubmit}
      className="flex-1 scroll-mt-80 border border-hairline bg-panel-ime px-24 py-34 md:px-42 md:py-38"
    >
      <Display as="h2" className="text-24 md:text-28">
        {t.careers.form.title}
      </Display>
      <p className="mt-8 font-body text-15 font-medium text-ink-3">{t.careers.form.subtitle}</p>

      <div className="mt-26 grid grid-cols-1 gap-18 sm:grid-cols-2">
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
            {...register('name')}
          />
        </Field>

        <Field
          label={t.forms.labels.phone}
          htmlFor={`${uid}-phone`}
          required
          requiredHint={t.common.required}
          error={errors.phone?.message}
        >
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
            {...register('email')}
          />
        </Field>

        <Field label={t.forms.labels.role} htmlFor={`${uid}-role`}>
          <Select id={`${uid}-role`} {...register('role')}>
            <option value="">{t.careers.form.spontaneous}</option>
            {positions.map((position) => (
              <option key={position.slug} value={position.slug}>
                {position.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-18">
        <p id={`${uid}-cv-label`} className="mb-7 font-body text-11 tracking-10 text-ink-3">
          {t.forms.labels.cv}{' '}
          <span aria-hidden="true" className="text-gold">
            *
          </span>
          <span className="sr-only"> ({t.common.required})</span>
        </p>
        <Dropzone
          id={`${uid}-cv`}
          kind="cv"
          label={t.forms.labels.cv}
          compact
          files={cv}
          onChange={setCv}
          describedBy={`${uid}-cv-label`}
          invalid={Boolean(errors.root)}
        />
        <FieldError>{errors.root?.message}</FieldError>
      </div>

      <Field
        label={t.forms.labels.about}
        htmlFor={`${uid}-about`}
        className="mt-18"
        error={errors.about?.message}
      >
        <Textarea
          id={`${uid}-about`}
          className="h-64"
          placeholder={t.forms.placeholders.about}
          invalid={Boolean(errors.about)}
          {...register('about')}
        />
      </Field>

      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`${uid}-website`}>Sito web</label>
        <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="mt-18">
        <Checkbox id={`${uid}-privacy`} invalid={Boolean(errors.privacy)} {...register('privacy')}>
          {t.forms.privacyJob}{' '}
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

      <Button type="submit" variant="gold" size="formSm" className="mt-22" disabled={isSubmitting}>
        {isSubmitting ? t.careers.form.sending : t.careers.form.submit}
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </Button>
    </form>
  );
}
