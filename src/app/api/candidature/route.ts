import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { jobApplicationSchema } from '@/lib/validation/schemas';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

/** Candidatura da /lavora-con-noi: stessa sequenza valida → salva → notifica. */
export async function POST(request: Request) {
  const limiter = rateLimit(clientKey(request, 'candidature'), {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Hai già inviato più candidature. Riprova fra qualche minuto.' },
      { status: 429, headers: { 'Retry-After': String(limiter.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const localeHint =
    typeof payload === 'object' && payload !== null && 'locale' in payload
      ? String((payload as { locale?: unknown }).locale)
      : 'it';
  const dictionary = getDictionary(isLocale(localeHint) ? localeHint : 'it');

  const parsed = jobApplicationSchema(dictionary.forms.errors).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dati non validi.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  if (data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const saved = await prisma.jobApplication.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      role: data.role || null,
      about: data.about || null,
      cv: data.cv ? JSON.stringify(data.cv) : null,
      locale: data.locale,
    },
  });

  const mail = await sendMail({
    subject: `Nuova candidatura — ${data.name}${data.role ? ` (${data.role})` : ''}`,
    replyTo: data.email,
    text: [
      `Nome:     ${data.name}`,
      `Telefono: ${data.phone}`,
      `Email:    ${data.email}`,
      `Ruolo:    ${data.role || 'candidatura spontanea'}`,
      data.about ? `\nSu di sé:\n${data.about}` : null,
      data.cv ? `\nCurriculum: ${data.cv.name} → ${site.url}${data.cv.url}` : null,
      `\nRicevuta il ${saved.createdAt.toISOString()} · lingua ${data.locale}`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (!mail.delivered) {
    console.error(
      `[candidature] candidatura ${saved.id} salvata ma non notificata via email: ${mail.error}`,
    );
  }

  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
}
