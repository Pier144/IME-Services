import 'server-only';
import { site } from '@/lib/site';

/**
 * Invio delle notifiche interne (nuova richiesta di preventivo, nuova
 * candidatura). Tre driver, scelti con MAIL_DRIVER:
 *
 *   console → stampa il messaggio nei log. È il default in sviluppo: il sito
 *             funziona subito, senza configurare niente.
 *   smtp    → server SMTP classico, via nodemailer.
 *   resend  → API Resend, via fetch (nessuna dipendenza aggiuntiva).
 *
 * Un errore di invio non deve mai far perdere la richiesta: viene registrato e
 * segnalato al chiamante, ma il dato è già salvato a database.
 */

export type MailMessage = {
  subject: string;
  /** Corpo in testo semplice: queste sono notifiche interne, non newsletter. */
  text: string;
  replyTo?: string;
};

export type MailResult = { delivered: boolean; driver: string; error?: string };

function recipients(): string {
  return process.env.MAIL_TO || site.email;
}

function sender(): string {
  return process.env.MAIL_FROM || `Sito ${site.shortName} <no-reply@ime-service.it>`;
}

async function sendWithConsole(message: MailMessage): Promise<MailResult> {
  const separator = '─'.repeat(72);
  console.info(
    [
      separator,
      `EMAIL (driver "console": non è stata spedita davvero)`,
      `Da:       ${sender()}`,
      `A:        ${recipients()}`,
      message.replyTo ? `Rispondi: ${message.replyTo}` : null,
      `Oggetto:  ${message.subject}`,
      separator,
      message.text,
      separator,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  return { delivered: true, driver: 'console' };
}

async function sendWithSmtp(message: MailMessage): Promise<MailResult> {
  const { host, port, secure, user, pass } = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  };

  if (!host) {
    return { delivered: false, driver: 'smtp', error: 'SMTP_HOST non configurato.' };
  }

  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transport.sendMail({
    from: sender(),
    to: recipients(),
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
  });

  return { delivered: true, driver: 'smtp' };
}

async function sendWithResend(message: MailMessage): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { delivered: false, driver: 'resend', error: 'RESEND_API_KEY non configurata.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender(),
      to: recipients().split(',').map((address) => address.trim()),
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      driver: 'resend',
      error: `Resend ha risposto ${response.status}.`,
    };
  }

  return { delivered: true, driver: 'resend' };
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const driver = process.env.MAIL_DRIVER ?? 'console';

  try {
    switch (driver) {
      case 'smtp':
        return await sendWithSmtp(message);
      case 'resend':
        return await sendWithResend(message);
      default:
        return await sendWithConsole(message);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'errore sconosciuto';
    console.error(`[mail] invio non riuscito con driver "${driver}": ${reason}`);
    return { delivered: false, driver, error: reason };
  }
}
