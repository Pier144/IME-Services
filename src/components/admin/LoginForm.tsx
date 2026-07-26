'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const uid = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(apiRoutes.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError(t.admin.login.error);
        return;
      }

      router.replace(adminRoutes.news);
      router.refresh();
    } catch {
      setError(t.admin.login.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-30">
      <Field label={t.admin.login.email} htmlFor={`${uid}-email`} tone="admin">
        <Input
          id={`${uid}-email`}
          type="email"
          tone="admin"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label={t.admin.login.password} htmlFor={`${uid}-password`} tone="admin" className="mt-18">
        <Input
          id={`${uid}-password`}
          type="password"
          tone="admin"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      {error && (
        <p role="alert" className="mt-16 border border-red px-14 py-10 font-body text-13 text-red">
          {error}
        </p>
      )}

      <Button type="submit" variant="gold" size="admin" className="mt-24 w-full" disabled={busy}>
        {busy ? t.admin.login.submitting : t.admin.login.submit}
      </Button>
    </form>
  );
}
