import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { adminRoutes } from './routes';

/**
 * Autenticazione dell'area riservata.
 *
 * Un solo ruolo (la redazione) e credenziali da variabili d'ambiente: è quanto
 * serve a un backoffice usato da una-due persone. La sessione è un JWT firmato
 * dentro un cookie httpOnly, quindi non c'è nessuna tabella di sessioni da
 * mantenere. Passare a NextAuth in futuro significa riscrivere solo questo file.
 */

const COOKIE_NAME = 'ime_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 ore

export type Session = { email: string };

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error(
      'AUTH_SECRET mancante o troppo corto. Generane uno con: ' +
        'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
    );
  }
  return new TextEncoder().encode(value);
}

/** Confronto a tempo costante: non deve trapelare quanti caratteri sono giusti. */
function equals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    // Confronta comunque, per non rendere misurabile la differenza di lunghezza.
    timingSafeEqual(bufferA, bufferA);
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}

export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    console.error('[auth] ADMIN_EMAIL o ADMIN_PASSWORD non configurate: accesso impossibile.');
    return false;
  }

  const emailOk = equals(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = equals(password, expectedPassword);
  return emailOk && passwordOk;
}

export async function createSession(email: string): Promise<void> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.email === 'string' ? { email: payload.email } : null;
  } catch {
    return null;
  }
}

/** Nelle pagine admin: se non c'è sessione si finisce sul login. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(adminRoutes.login);
  return session;
}
