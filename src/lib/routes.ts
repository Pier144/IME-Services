/**
 * Tutte le rotte del sito in un posto solo.
 * Gli slug restano in italiano anche in inglese: cambia solo il prefisso di
 * lingua (gestito da `localePath`), così l'albero delle pagine è uno.
 */
export const routes = {
  home: '/',
  about: '/chi-siamo',
  impianti: '/impianti',
  luminarie: '/luminarie',
  subject: (slug: string) => `/luminarie/${slug}`,
  custom: '/soggetti-personalizzati',
  news: '/news',
  article: (slug: string) => `/news/${slug}`,
  careers: '/lavora-con-noi',
  privacy: '/privacy',
} as const;

/** L'area riservata è solo in italiano e vive fuori dall'albero localizzato. */
export const adminRoutes = {
  root: '/admin',
  login: '/admin/login',
  news: '/admin/news',
  article: (id: string) => `/admin/news/${id}`,
  newArticle: '/admin/news/nuovo',
} as const;

export const apiRoutes = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  quotes: '/api/preventivi',
  applications: '/api/candidature',
  upload: '/api/upload',
  articles: '/api/admin/articoli',
  article: (id: string) => `/api/admin/articoli/${id}`,
} as const;
