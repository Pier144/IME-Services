import { z } from 'zod';
import type { Dictionary } from '@/i18n/types';

/**
 * Schemi condivisi fra browser e server.
 *
 * Sono fabbriche che ricevono i messaggi d'errore dal dizionario: la stessa
 * regola vale da entrambe le parti e il testo arriva nella lingua giusta.
 * La validazione lato server non si fida mai di quella lato client: gira di
 * nuovo, identica, dentro il route handler.
 */

type Errors = Dictionary['forms']['errors'];

export const storedFileSchema = z.object({
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  key: z.string().min(1),
  url: z.string().min(1),
  uploadedAt: z.string().min(1),
});

export type StoredFileInput = z.infer<typeof storedFileSchema>;

/** Numeri italiani e internazionali, con spazi, punti, trattini e parentesi. */
const PHONE = /^[+()\d][\d\s.\-()/]{5,24}$/;

export function quoteRequestSchema(errors: Errors) {
  return z
    .object({
      name: z.string().trim().min(2, { message: errors.nameShort }).max(120),
      company: z.string().trim().max(160, { message: errors.tooLong }).optional().or(z.literal('')),
      email: z.email({ message: errors.emailInvalid }),
      phone: z
        .string()
        .trim()
        .max(40)
        .regex(PHONE, { message: errors.phoneInvalid })
        .optional()
        .or(z.literal('')),
      subjectType: z.string().trim().max(80).optional().or(z.literal('')),
      quantity: z.string().trim().max(40).optional().or(z.literal('')),
      dimensions: z.string().trim().max(160).optional().or(z.literal('')),
      usage: z.string().trim().max(80).optional().or(z.literal('')),
      notes: z.string().trim().max(4000, { message: errors.tooLong }).optional().or(z.literal('')),
      subjects: z.array(z.string().max(120)).max(50).default([]),
      attachments: z.array(storedFileSchema).max(10).default([]),
      privacy: z.literal(true, { message: errors.privacyRequired }),
      locale: z.enum(['it', 'en']).default('it'),
      source: z.enum(['soggetti-personalizzati', 'catalogo', 'impianti', 'home']).default(
        'soggetti-personalizzati',
      ),
      /**
       * Campo esca: invisibile nel form, i robot lo riempiono e le persone no.
       * Qui viene accettato senza obiezioni: è il route handler a scartare in
       * silenzio la richiesta, rispondendo come se fosse andata a buon fine.
       * Farlo fallire in validazione direbbe al mittente che è stato scoperto.
       */
      website: z.string().max(200).optional().default(''),
    })
    .refine((value) => Boolean(value.email) || Boolean(value.phone), {
      message: errors.contactRequired,
      path: ['phone'],
    });
}

export type QuoteRequestInput = z.infer<ReturnType<typeof quoteRequestSchema>>;

export function jobApplicationSchema(errors: Errors) {
  return z.object({
    name: z.string().trim().min(2, { message: errors.nameShort }).max(120),
    phone: z
      .string()
      .trim()
      .min(1, { message: errors.phoneRequired })
      .regex(PHONE, { message: errors.phoneInvalid }),
    email: z.email({ message: errors.emailInvalid }),
    role: z.string().trim().max(120).optional().or(z.literal('')),
    about: z.string().trim().max(2000, { message: errors.tooLong }).optional().or(z.literal('')),
    cv: storedFileSchema.nullable().refine((value) => value !== null, {
      message: errors.cvRequired,
    }),
    privacy: z.literal(true, { message: errors.privacyRequired }),
    locale: z.enum(['it', 'en']).default('it'),
    /** Campo esca, vedi la nota in `quoteRequestSchema`. */
    website: z.string().max(200).optional().default(''),
  });
}

export type JobApplicationInput = z.infer<ReturnType<typeof jobApplicationSchema>>;
