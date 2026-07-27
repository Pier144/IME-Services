# IME Service — sito

Nuovo sito di **IME Service srls** (Domegliara, Verona): impianti elettrici civili e industriali
e luminarie artistiche con il marchio *La Fabbrica di Babbo Natale*.

Implementazione in React del design approvato nel turno 2 dell'handoff
(`design/Mockup IME Service.dc.html`, opzioni `1a` e `2a`–`2j`), direzione visiva **"Notturna"**.

---

## Avvio rapido

```bash
npm install
cp .env.example .env      # poi incolla DATABASE_URL e DIRECT_URL
npm run setup
npm run dev
```

Il database è **Postgres su Supabase**, quindi prima di `npm run setup` vanno incollate in `.env`
le due stringhe di connessione (Supabase → Project Settings → Database → Connection string).
`npm run setup` genera il client Prisma, applica le migrazioni e inserisce i 14 articoli del mockup.

> **Attenzione:** in sviluppo si punta allo stesso database della produzione, perché il branching
> di Supabase richiede un piano a pagamento. Finché è così, `npm run db:seed` scrive sui dati veri.
> Per lavorare tranquilli conviene un secondo progetto Supabase gratuito da usare come sviluppo, e
> tenere quello di produzione solo nelle variabili di Vercel.

Area riservata: <http://localhost:3000/admin> · credenziali in `.env`
(`redazione@ime-service.it` / `cambiami-subito` — **da cambiare** prima di qualunque uso reale).

### Comandi

| Comando | Cosa fa |
|---|---|
| `npm run dev` | server di sviluppo |
| `npm run build` / `npm start` | build e avvio di produzione |
| `npm run typecheck` | TypeScript, nessun `any` implicito |
| `npm run lint` | ESLint (regole Next + TypeScript) |
| `npm run db:migrate` | crea una nuova migrazione (sviluppo) |
| `npm run db:deploy` | applica le migrazioni pendenti (produzione) |
| `npm run db:seed` | aggiunge gli articoli mancanti — non sovrascrive quelli esistenti |
| `npm run db:studio` | apre Prisma Studio sul database |

---

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript** — SEO, i18n e rendering statico.
- **Tailwind CSS v4** con i token del design in `src/app/globals.css`.
- **Prisma + Postgres** su Supabase (progetto `IME-Services`, regione `eu-west-1`).
- **react-hook-form + zod** per i form, con gli stessi schemi lato client e lato server.
- **next/font** per Archivo, Work Sans e Satisfy, self-hostati (nessuna chiamata al CDN di Google).

Nessuna libreria di animazione: le uniche animazioni sono il *twinkle* in CSS e il carosello dell'hero.

---

## Pagine

| Rotta | Mockup | Note |
|---|---|---|
| `/` | `1a` | hero a 4 slide, due anime, catalogo, news, CTA |
| `/luminarie` | `2a` | tab stagione + chip tipologia, stato in querystring |
| `/luminarie/[slug]` | `2b` | galleria, scheda tecnica, richiesta multipla |
| `/soggetti-personalizzati` | `2c` | come funziona + form con allegati |
| `/news` | `2d` | articolo in evidenza, griglia, paginazione |
| `/news/[slug]` | `2e` | lettura, citazioni, tag, prev/next, JSON-LD |
| `/chi-siamo` | `2f` | storia, timeline, numeri, luoghi |
| `/impianti` | `2g` | servizi, processo, settori |
| `/lavora-con-noi` | `2h` | posizioni aperte + candidatura |
| `/privacy` | — | struttura pronta, testo legale da fornire |
| `/admin/news` | `2i` | lista articoli con ricerca, filtri, paginazione |
| `/admin/news/[id]` | `2j` | editor con anteprima live e contatori SEO |

L'inglese vive sotto lo stesso albero con prefisso `/en` (`/en/luminarie`, `/en/news/...`).
L'italiano non ha prefisso: `/it/qualcosa` viene rediretto (308) alla forma canonica.

---

## Come è organizzato

```
src/
├── app/
│   ├── [locale]/          pagine pubbliche (qui vivono <html> e <body>)
│   ├── admin/             area riservata, solo italiano, non indicizzata
│   └── api/               route handler: form, upload, auth, articoli
├── components/
│   ├── brand/             LogoIme · LogoFabbrica · WaveDivider
│   ├── media/             PhotoSlot · Twinkles
│   ├── ui/                Button · Chip · Field · Pagination · CtaBand · PageHero…
│   ├── layout/            Header · Footer
│   ├── catalogo/ news/ forms/ admin/
│   └── seo/               JsonLd
├── data/                  catalogo soggetti, tipologie, categorie news
├── i18n/                  dizionari it/en, tipi, provider
├── lib/                   prisma, auth, storage, mail, articles, validation
└── proxy.ts               routing delle lingue
```

### Design token

Stanno tutti in [`src/app/globals.css`](src/app/globals.css), dentro `@theme`, e vengono dal
`design/README.md`. Le scale native di Tailwind sono **azzerate** di proposito: nel progetto
esistono solo i valori del design system.

- `--spacing: 1px` → le misure si scrivono come nel design: `px-90`, `pt-76`, `gap-13`.
- Scala tipografica per corpo in px: `text-10-5` … `text-58`.
- Interlinea in centesimi: `leading-185` = 1.85.
- Letter-spacing in centesimi di em: `tracking-34` = .34em (la firma dello stile: non va omesso).
- Un solo colore d'azione, l'oro `--color-gold`. Blu = mondo impianti, rosso = mondo Natale.
- `border-radius: 0` ovunque tranne pill e bullet; **nessuna ombra**: la profondità viene dai
  fondi (`night` / `panel-ime` / `panel-fabbrica`) e dalle hairline.

### Fotografie

Le foto dell'azienda non ci sono ancora. Al loro posto ci sono **21 immagini stock provvisorie**
(Pexels, licenza libera anche per uso commerciale) mappate in [`src/data/photos.ts`](src/data/photos.ts)
e documentate in [CREDITI-FOTO.md](CREDITI-FOTO.md) — comprese quelle che mancano ancora.

Tutto il resto resta `<PhotoSlot>`: replica il segnaposto del mockup e porta con sé **l'etichetta
descrittiva**, che è il brief fotografico da consegnare al cliente. Quando le foto vere arrivano
basta metterle in `public/foto/` con lo stesso nome: proporzioni e ingombro non cambiano, nessuna
pagina va ritoccata.

### Loghi

`<LogoIme />` e `<LogoFabbrica />` sono ricostruzioni tipografiche isolate in due file soli:
all'arrivo degli SVG ufficiali si sostituisce il contenuto e cambia ovunque.

---

## Configurazione

Tutto passa da `.env` (vedi `.env.example`).

### Database

Postgres gestito da Supabase. Servono **due** stringhe di connessione, e non vanno scambiate:

- `DATABASE_URL` → *Transaction pooler*, porta **6543**. La usa l'applicazione: su serverless ogni
  istanza aprirebbe connessioni proprie e senza pooler il database esaurisce i posti.
- `DIRECT_URL` → *Direct connection*, porta **5432**. La usano le migrazioni, che hanno bisogno di
  una sessione vera per prendere i lock sullo schema.

Le tabelle stanno nello schema `public`, che Supabase espone anche via Data API con la chiave
`anon` — che è pubblica. La migrazione iniziale quindi **attiva RLS senza policy** e **revoca i
privilegi** ai ruoli `anon` e `authenticated`: da lì non si legge niente. L'applicazione non è
toccata perché Prisma si collega con il ruolo `postgres`, che ha `BYPASSRLS`.

Liste e blocchi restano serializzati in JSON dentro colonne testuali: non li interroghiamo mai
dall'interno, quindi il tipo `Json` nativo non aggiungerebbe nulla.

### Allegati

`STORAGE_DRIVER=local` (default in sviluppo) scrive in `./storage/uploads`, fuori da `public/`.
`STORAGE_DRIVER=s3` usa Supabase Storage tramite il suo endpoint S3-compatibile — e funziona
identico con R2, Scaleway, MinIO o S3 vero.

**Il bucket va creato privato.** Nessun allegato ha mai un indirizzo pubblico: si passa sempre da
`/api/media/<chiave>`, che controlla chi sta chiedendo e poi rimanda a un link firmato valido
cinque minuti. Disegni allegati alle richieste (`preventivi/`) e curriculum (`candidature/`)
richiedono una sessione dell'area riservata; a chi non ce l'ha si risponde 404, senza nemmeno
confermare che il file esista.

Limiti come da design: **20 MB** per gli allegati di progetto, **10 MB** per i curriculum,
con controllo di dimensione e formato ripetuto lato server.

### Email

`MAIL_DRIVER=console` (default) stampa la notifica nei log — comodo in sviluppo, nessuna
configurazione. In produzione `smtp` (nodemailer) o `resend`. Se l'invio fallisce la richiesta
**non va persa**: è già salvata a database e l'errore finisce nei log.

---

## Deploy su Vercel

Progetto Supabase `IME-Services` (`eu-west-1`) e progetto Vercel `ime-services` esistono già,
collegato quest'ultimo al repository GitHub. Schema applicato, contenuti seminati, bucket creato:
**manca solo la configurazione delle variabili d'ambiente su Vercel.**

1. **Variabili d'ambiente** — da impostare su *tutti e tre* gli ambienti (Production, Preview,
   Development), non solo Production: sitemap e pagine articolo interrogano il database **durante
   la build**, e senza `DIRECT_URL` la build si ferma prima ancora di partire.

   | Variabile | Valore |
   | --- | --- |
   | `DATABASE_URL` | transaction pooler, porta 6543 (vedi `.env.example`) |
   | `DIRECT_URL` | session pooler, porta 5432 |
   | `AUTH_SECRET` | **da rigenerare**, mai riusare quello di sviluppo |
   | `ADMIN_EMAIL` · `ADMIN_PASSWORD` | credenziali vere dell'area riservata |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.ime-service.it` |
   | `STORAGE_DRIVER` | `s3` — con `local` ogni caricamento fallisce, il disco è di sola lettura |
   | `S3_ENDPOINT` · `S3_REGION` · `S3_BUCKET` | vedi `.env.example` |
   | `S3_ACCESS_KEY_ID` · `S3_SECRET_ACCESS_KEY` | *Supabase → Storage → S3 Access Keys* |
   | `MAIL_DRIVER` + `SMTP_*` (o `RESEND_API_KEY`) | con `console` nessuno riceve le notifiche |

   Il segreto di sessione si genera con:
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

2. **Migrazioni** — si applicano a mano, prima del deploy: `npm run db:deploy`.

   Non stanno nel comando di build apposta. Vercel usa lo stesso comando per Production e per
   Preview, e finché c'è un solo progetto Supabase le Preview puntano al database di produzione:
   una migrazione su un branch ne cambierebbe lo schema prima ancora della revisione. Se un giorno
   nascerà un progetto Supabase separato per le Preview, `prisma migrate deploy` potrà tornare in
   `vercel.json`.

3. **Dominio** — collega `ime-service.it` e allinea `NEXT_PUBLIC_SITE_URL`, che alimenta URL
   canonici, Open Graph e sitemap.

`vercel.json` fissa la regione `dub1` (Dublino, accanto al database) e il comando di build
`prisma generate && next build`.

### Cosa resta da sistemare prima del go-live

- **Piano Supabase**: sul gratuito i progetti vengono messi in pausa dopo 7 giorni di inattività.
  Su un sito con traffico stagionale succede fuori stagione. Serve il piano Pro.
- **Limite di frequenza dei form**: il contatore è in memoria, quindi vale per singola istanza
  serverless. I form restano protetti dal campo esca, ma per un limite vero serve un contatore
  condiviso (Upstash Redis o simile).
- **DPA e informativa**: Vercel e Supabase sono responsabili del trattamento e vanno elencati
  nell'informativa privacy, che è ancora una traccia.

---

## Scelte da confermare

Tre punti in cui il materiale di design non copriva il caso e ho preso una decisione esplicita.
Vanno riviste con il designer.

1. **Menu Luminarie a tendina.** Il README lo descrive ("due colonne, Natalizie / Eventi, con le
   tipologie sotto") ma l'unico mockup che lo disegna aperto è `1b`, che appartiene alla direzione
   scartata "Brand". L'ho ricostruito nel linguaggio della direzione approvata: pannello scuro,
   hairline, voce attiva in oro, nessun raggio e nessuna ombra.
2. **Sidebar admin sotto i 900px.** Il README suggerisce di collassarla a icone, ma il design
   dichiara che le icone sono assenti per scelta e non esiste un set da usare. È diventata una
   striscia orizzontale scorrevole in cima, che resta dentro il linguaggio del progetto.
3. **Contatore della richiesta multipla.** Il mockup non lo disegna e il README chiede di
   proporlo: è una pastiglia oro accanto a "Soggetti personalizzati", visibile solo quando c'è
   almeno un soggetto selezionato.

Il resto del responsive segue le regole scritte nel `design/README.md`
(breakpoint 1200 / 900 / 640, gutter 90 → 24, griglie 4→2→1 e 3→2→1, hero 600→480→380 con
titolo 58→40→32, colonna articolo 210 → 24, navigazione in pannello).

---

## Contenuti segnaposto

Da sostituire prima del go-live:

- **Catalogo soggetti** (`src/data/subjects.ts`) — 48 soggetti plausibili e coerenti col mestiere,
  ma inventati. Gli otto disegnati nel mockup `2a` e i quattro correlati di `2b` hanno i nomi
  originali. Serve l'anagrafica reale.
- **News** (`prisma/seed.ts`) — i 14 articoli del mockup `2i`, con i titoli e le date reali del
  design e corpi scritti per il collaudo.
- **Numeri di "Chi siamo"** (55+ anni, 3 generazioni, 80+ comuni, 100% produzione interna) —
  sono stime, il `design/README.md` chiede di confermarle con il cliente.
- **Informativa privacy** — la pagina esiste ed è linkata, il testo legale va fornito.
- **Posizioni aperte** — le tre del mockup `2h`, da confermare.

---

## Accessibilità

- Focus visibile obbligatorio: outline oro 2px con offset 2px su ogni elemento interattivo.
- Form con `<label>` reali legate al campo, mai il solo placeholder; errori annunciati con
  `role="alert"` e collegati via `aria-describedby`.
- Carosello navigabile da tastiera (frecce ← →), in pausa su hover e su focus.
- `prefers-reduced-motion: reduce` spegne twinkle, crossfade e ingrandimenti delle foto.
- Link "Vai al contenuto" come primo elemento focusabile.
- Nessuna pagina scorre in orizzontale a 375px.

---

## Sicurezza

- Sessione dell'area riservata in un cookie `httpOnly` firmato (JWT, `jose`); credenziali
  confrontate a tempo costante; login limitato a 5 tentativi ogni 10 minuti.
- Form pubblici con limite di frequenza per indirizzo e campo esca invisibile: se arriva
  compilato la richiesta viene scartata in silenzio, rispondendo come se fosse andata a buon fine.
- Upload validati di nuovo lato server (dimensione, estensione, tipo) e salvati con nome
  generato; il percorso su disco non è mai indovinabile e i traversal sono bloccati.
- Il testo scritto in redazione non viene mai iniettato come markup: viene interpretato e
  trasformato in nodi React, con solo tre marcatori inline ammessi e i link filtrati per schema.

---

## Materiali di design

In `design/`, come consegnati:

- `Mockup IME Service.dc.html` — canvas con tutte le schermate (turno 2 = direzione approvata).
- `README.md` — specifica di design completa: token, tipografia, misure, comportamenti.
- `PROMPT.md` — il brief di sviluppo.
