import { NextResponse } from 'next/server';
import { createSession, verifyCredentials } from '@/lib/auth';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * Accesso all'area riservata.
 * Cinque tentativi ogni dieci minuti per indirizzo: basta a rendere inutile un
 * tentativo a forza bruta su una password sola.
 */
export async function POST(request: Request) {
  const limiter = rateLimit(clientKey(request, 'login'), { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Troppi tentativi. Riprova fra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(limiter.retryAfterSeconds) } },
    );
  }

  let payload: { email?: unknown; password?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const email = typeof payload.email === 'string' ? payload.email : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!verifyCredentials(email, password)) {
    // Messaggio unico: non si dice se a sbagliare è l'email o la password.
    // `remaining` sì: sapere che restano due tentativi non aiuta chi attacca
    // (il limite è pubblico e misurabile provando) ma evita a chi ha diritto
    // di entrare di ritrovarsi bloccato senza preavviso.
    return NextResponse.json(
      { error: 'Credenziali non valide.', remaining: limiter.remaining },
      { status: 401 },
    );
  }

  await createSession(email);
  return NextResponse.json({ ok: true });
}
