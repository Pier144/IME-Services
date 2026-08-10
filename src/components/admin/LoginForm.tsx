'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useI18n } from '@/i18n/provider';
import { adminRoutes, apiRoutes } from '@/lib/routes';
import { cn } from '@/lib/utils';

/**
 * Accesso all'area riservata (handoff 4a: il disegno non cambia, cambia cosa
 * dice).
 *
 * Prima mostrava «Email o password non corretti» qualunque cosa rispondesse il
 * server: chi finiva contro il limitatore continuava a riprovare senza capire
 * perché non entrava. Ora i due casi si distinguono.
 *
 * - **401** — credenziali sbagliate: riquadro rosso, e quanti tentativi
 *   restano. Il messaggio resta unico per email e password: non si dice mai
 *   quale delle due è sbagliata.
 * - **429** — bloccato: riquadro **in oro**, non rosso. Non è un errore di chi
 *   scrive, è una porta chiusa a tempo; il modulo si disabilita e si riabilita
 *   da solo alla scadenza letta da `Retry-After`.
 */

type Esito =
  | { kind: 'nessuno' }
  | { kind: 'credenziali'; remaining: number | null }
  | { kind: 'bloccato'; until: Date };

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const uid = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esito, setEsito] = useState<Esito>({ kind: 'nessuno' });
  const [busy, setBusy] = useState(false);

  const bloccato = esito.kind === 'bloccato';

  /** Alla scadenza il modulo torna utilizzabile da sé, senza ricaricare. */
  useEffect(() => {
    if (esito.kind !== 'bloccato') return;
    // Anche a scadenza già passata si passa dal timer invece di aggiornare lo
    // stato qui: un `setState` nel corpo dell'effetto fa rendere due volte.
    const attesa = Math.max(0, esito.until.getTime() - Date.now());
    const timer = window.setTimeout(() => setEsito({ kind: 'nessuno' }), attesa);
    return () => window.clearTimeout(timer);
  }, [esito]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setEsito({ kind: 'nessuno' });

    try {
      const response = await fetch(apiRoutes.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 429) {
        const secondi = Number(response.headers.get('Retry-After') ?? '0');
        setEsito({
          kind: 'bloccato',
          until: new Date(Date.now() + Math.max(1, secondi) * 1000),
        });
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { remaining?: number } | null;
        setEsito({
          kind: 'credenziali',
          remaining: typeof payload?.remaining === 'number' ? payload.remaining : null,
        });
        return;
      }

      router.replace(adminRoutes.news);
      router.refresh();
    } catch {
      setEsito({ kind: 'credenziali', remaining: null });
    } finally {
      setBusy(false);
    }
  }

  const invalido = esito.kind === 'credenziali';

  return (
    <form onSubmit={onSubmit} noValidate className="mt-30">
      <div className={cn(bloccato && 'opacity-45')}>
        <Field label={t.admin.login.email} htmlFor={`${uid}-email`} tone="admin">
          <Input
            id={`${uid}-email`}
            type="email"
            tone="admin"
            autoComplete="username"
            required
            invalid={invalido}
            disabled={bloccato}
            aria-describedby={esito.kind === 'nessuno' ? undefined : `${uid}-esito`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field
          label={t.admin.login.password}
          htmlFor={`${uid}-password`}
          tone="admin"
          className="mt-18"
        >
          <Input
            id={`${uid}-password`}
            type="password"
            tone="admin"
            autoComplete="current-password"
            required
            invalid={invalido}
            disabled={bloccato}
            aria-describedby={esito.kind === 'nessuno' ? undefined : `${uid}-esito`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
      </div>

      {esito.kind !== 'nessuno' && (
        <p
          id={`${uid}-esito`}
          role="alert"
          className={cn(
            'mt-16 border px-14 py-10 font-body text-13 leading-160',
            bloccato ? 'border-gold text-gold' : 'border-red text-red',
          )}
        >
          {bloccato ? t.admin.login.blocked : t.admin.login.error}
          <br />
          <span className="text-ink-3">
            {esito.kind === 'bloccato'
              ? t.admin.login.retryAt.replace(
                  '{time}',
                  esito.until.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                )
              : esito.remaining === null
                ? ''
                : esito.remaining === 0
                  ? t.admin.login.remainingNone
                  : esito.remaining === 1
                    ? t.admin.login.remainingOne
                    : t.admin.login.remaining.replace('{count}', String(esito.remaining))}
          </span>
        </p>
      )}

      <Button
        type="submit"
        variant="gold"
        size="admin"
        className="mt-24 w-full"
        disabled={busy || bloccato}
      >
        {busy ? t.admin.login.submitting : t.admin.login.submit}
      </Button>
    </form>
  );
}
