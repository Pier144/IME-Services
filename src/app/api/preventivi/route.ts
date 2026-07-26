import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mail';
import { clientKey, rateLimit } from '@/lib/rate-limit';
import { quoteRequestSchema } from '@/lib/validation/schemas';
import { getDictionary } from '@/i18n';
import { isLocale } from '@/i18n/config';
import { getSubject } from '@/data/subjects';
import { site } from '@/lib/site';

export const runtime = 'nodejs';

/**
 * Richiesta di preventivo.
 *
 * Ordine delle operazioni: valida → salva → prova a notificare.
 * La notifica per email può fallire (SMTP giù, chiave scaduta) senza che la
 * richiesta vada persa: a quel punto è già a database e la si ritrova
 * nell'area riservata.
 */
export async function POST(request: Request) {
  const limiter = rateLimit(clientKey(request, 'preventivi'), {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: 'Hai già inviato più richieste. Riprova fra qualche minuto.' },
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

  const parsed = quoteRequestSchema(dictionary.forms.errors).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dati non validi.', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Campo esca compilato: si risponde 201 senza salvare, per non dare indizi.
  if (data.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const saved = await prisma.quoteRequest.create({
    data: {
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone || null,
      subjectType: data.subjectType || null,
      quantity: data.quantity || null,
      dimensions: data.dimensions || null,
      usage: data.usage || null,
      notes: data.notes || null,
      subjects: JSON.stringify(data.subjects),
      attachments: JSON.stringify(data.attachments),
      source: data.source,
      locale: data.locale,
    },
  });

  const subjectNames = data.subjects
    .map((slug) => getSubject(slug)?.name ?? slug)
    .filter(Boolean);

  const mail = await sendMail({
    subject: `Nuova richiesta di preventivo — ${data.name}`,
    replyTo: data.email,
    text: [
      `Nome:      ${data.name}`,
      data.company ? `Azienda:   ${data.company}` : null,
      `Email:     ${data.email}`,
      data.phone ? `Telefono:  ${data.phone}` : null,
      data.subjectType ? `Tipo:      ${data.subjectType}` : null,
      data.quantity ? `Quantità:  ${data.quantity}` : null,
      data.dimensions ? `Misure:    ${data.dimensions}` : null,
      data.usage ? `Serve per: ${data.usage}` : null,
      subjectNames.length > 0 ? `Soggetti:  ${subjectNames.join(', ')}` : null,
      data.notes ? `\nNote:\n${data.notes}` : null,
      data.attachments.length > 0
        ? `\nAllegati:\n${data.attachments.map((file) => `- ${file.name} → ${site.url}${file.url}`).join('\n')}`
        : null,
      `\nRicevuta il ${saved.createdAt.toISOString()} · lingua ${data.locale} · origine ${data.source}`,
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (!mail.delivered) {
    console.error(
      `[preventivi] richiesta ${saved.id} salvata ma non notificata via email: ${mail.error}`,
    );
  }

  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
}
