import 'server-only';

/**
 * Limitatore di frequenza in memoria.
 *
 * Basta a fermare un invio ripetuto o uno script rudimentale su un sito
 * vetrina servito da un processo solo. Se un giorno il sito girerà su più
 * istanze, questo file va sostituito con un contatore condiviso (Redis o
 * simili): il resto del codice non cambia.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Pulizia opportunistica: le finestre scadute non restano in memoria. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; retryAfterSeconds: number; remaining: number } {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  // Quanti ne restano dopo questo. Serve al modulo di accesso per dirlo a chi
  // sta sbagliando la password: senza, ci si trova bloccati senza preavviso.
  return { allowed: true, retryAfterSeconds: 0, remaining: limit - bucket.count };
}

/** Identifica il chiamante dietro un eventuale reverse proxy. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'sconosciuto';
  return `${scope}:${ip}`;
}
