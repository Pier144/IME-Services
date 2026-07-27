/**
 * Anagrafica reale di IME Service srls.
 * Fonte: design/README.md → "Struttura del sito e navigazione".
 * Questi dati compaiono in header, footer, form e JSON-LD: si cambiano solo qui.
 */
export const site = {
  legalName: 'IME Service srls',
  shortName: 'IME Service',
  brandFabbrica: 'La Fabbrica di Babbo Natale',
  vat: '04236040236',
  address: {
    street: 'Via Adige 238',
    postalCode: '37015',
    city: 'Domegliara',
    province: 'VR',
    region: 'Veneto',
    country: 'IT',
  },
  phone: '045 2221396',
  phoneHref: '+390452221396',
  mobile: '345 3021563',
  mobileHref: '+393453021563',
  email: 'info@ime-service.it',
  editorialEmail: 'redazione@ime-service.it',
  openingHours: 'Lun-Ven 8:00-12:30 · 14:00-18:00',
  // Anno di costituzione della società (srls). Verificato: la P.IVA 04236040236
  // risulta a registro dal 2014 — la forma "srls" non esisteva prima del 2012,
  // quindi il 1968 che compariva qui non poteva riferirsi a questa società.
  foundedYear: 2014,
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000',
} as const;

/** "Via Adige 238, 37015 Domegliara (VR)" */
export const addressLine = `${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.province})`;

/** Limiti di upload dichiarati nel design. */
export const uploadLimits = {
  attachment: {
    maxBytes: 20 * 1024 * 1024,
    extensions: ['jpg', 'jpeg', 'png', 'pdf', 'ai', 'dwg'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/postscript',
      'application/illustrator',
      'image/vnd.dwg',
      'application/acad',
      'application/octet-stream',
    ],
  },
  cv: {
    maxBytes: 10 * 1024 * 1024,
    extensions: ['pdf', 'doc', 'docx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  cover: {
    maxBytes: 8 * 1024 * 1024,
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
} as const;

/** Soglie dei contatori SEO dell'editor (mockup 2j). */
export const seoLimits = {
  title: 70,
  description: 160,
} as const;
