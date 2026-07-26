# Handoff: Sito IME Service — redesign completo

## Overview
Redesign del sito di **IME Service srls** (Domegliara, Verona): impianti elettrici civili/industriali + luminarie
artistiche con il marchio *La Fabbrica di Babbo Natale*. Sostituisce il sito attuale (ime-service.it).

Il sito pubblico ha 8 pagine più una **area riservata** per la gestione delle news (lista + editor con anteprima
live). Direzione visiva approvata dal cliente: **"Notturna"** — fondo notte, foto delle luci protagoniste, un solo
colore d'azione (oro). Tipografia approvata: **Archivo** (titoli) + **Work Sans** (testo).

## About the Design Files
I file in questo bundle sono **riferimenti di design realizzati in HTML**: prototipi che mostrano aspetto e
comportamento previsti, **non codice di produzione da copiare**. Il compito è **ricreare questi design in React**
seguendo i pattern e le librerie del codebase di destinazione. Se il progetto è nuovo (nessun codebase esistente),
scegliere lo stack più adatto — vedi *Stack consigliato* — e implementare i design lì.

Il file `Mockup IME Service.dc.html` è un **canvas di mockup**: contiene più schermate affiancate, ciascuna in un
contenitore `.dv-opt` con un id (`2a`, `2b`, …). Il "cromo" del canvas (badge, etichette `.dv-*`, riquadri
tratteggiati `.phd`/`.phl`) **non fa parte del sito** — è impalcatura di presentazione. Va implementato solo il
contenuto dentro ogni `.dv-card`.

## Fidelity
**High-fidelity.** Colori, tipografia, spaziature e stati sono definitivi e vanno riprodotti fedelmente.
Due eccezioni dichiarate:
1. **Tutte le foto sono placeholder** (riquadri tratteggiati con etichetta che descrive il soggetto richiesto).
   Il cliente fornirà le immagini reali; nel frattempo usare un componente segnaposto con le stesse proporzioni.
2. **I loghi sono ricostruzioni testuali** (pill blu "IM**E**" + "SERVICE" in Archivo; "La Fabbrica di Babbo
   Natale" in Satisfy). Andranno sostituiti con gli SVG ufficiali quando disponibili: isolare in
   `<LogoIme />` e `<LogoFabbrica />` così la sostituzione è di un solo file.

---

## Stack consigliato (se non esiste già un codebase)
- **Next.js (App Router) + React + TypeScript** — necessario per SEO (sito vitrina, news indicizzate),
  i18n IT/EN e rendering statico delle pagine istituzionali.
- **Tailwind CSS** con i token qui sotto mappati in `tailwind.config`, oppure CSS Modules + custom properties.
- **next/font** per Archivo e Work Sans (self-hosted, non il CDN Google usato nel mockup). Satisfy solo per il
  wordmark della Fabbrica — meglio ancora: SVG.
- **CMS news**: le pagine admin `2i`/`2j` sono progettate come backoffice proprietario. Due strade valide:
  (a) implementare admin + API con Postgres/Prisma e auth (NextAuth credentials), (b) usare un CMS headless
  (Sanity/Payload) e considerare `2i`/`2j` come specifica dell'esperienza redazionale attesa.
  Se si sceglie (b), mantenere comunque: badge bozza/pubblicato, anteprima live desktop/mobile, contatori SEO.
- **Form**: react-hook-form + zod. Invio via route handler → email (Resend/SMTP) + persistenza della richiesta.
  L'upload allegati (disegni, CV) richiede storage (S3/UploadThing) e limiti dichiarati nel design.
- Nessuna dipendenza di animazione necessaria: le uniche animazioni sono un twinkle CSS e un carosello hero.

---

## Design Tokens

### Colori
| Token | Hex | Uso |
|---|---|---|
| `night` | `#0a0e1c` | fondo di tutte le pagine pubbliche |
| `panel-ime` | `#10162a` | card e blocchi "anima impianti" |
| `panel-fabbrica` | `#141326` | card e blocchi "anima Natale" |
| `admin-bg` | `#080b16` | sidebar e topbar area riservata |
| `text` | `#e9ecf6` | testo primario |
| `text-2` | `#c3cade` | paragrafi, valori form |
| `text-3` | `#8f9ab5` | didascalie, testo secondario |
| `text-4` | `#5f6a86` | placeholder input, meta admin |
| `gold` | `#f2c66d` | **unico colore d'azione**: link, CTA, tab attive, accenti |
| `gold-ink` | `#1a1405` | testo sopra fondo oro |
| `blue` | `#233d92` | brand IME (pill logo, filetto timeline) |
| `blue-lt` | `#7d9bff` | etichette categoria, numerazione IME |
| `blue-chip-bg` | `rgba(125,155,255,.14)` | badge "PUBBLICATO" |
| `blue-chip-tx` | `#9db2ff` | testo badge "PUBBLICATO" |
| `blue-dot` | `#3b5bd6` | bullet elenchi IME |
| `red` | `#d31f2e` | brand Fabbrica (bullet, filetto timeline) |
| `rose` | `#e08a8a` | occhielli Fabbrica |
| `rose-lt` | `#ffd9d9` | wordmark "La Fabbrica di Babbo Natale" |
| `logo-yellow` | `#ffd200` | la "E" nel logo IME |
| `hairline` | `rgba(255,255,255,.08)` | separatori di sezione, bordi card |
| `hairline-soft` | `rgba(255,255,255,.06)` | righe tabella admin |
| `field-border` | `rgba(255,255,255,.16)` | bordo input, chip non attive |
| `field-bg` | `rgba(255,255,255,.03)` | fondo input |

Gradienti fissi:
- fascia CTA: `linear-gradient(135deg,#141b36,#1b1430)` + bordo `rgba(255,255,255,.09)`
- velo su foto hero interne: `linear-gradient(180deg,rgba(10,14,28,.35),rgba(10,14,28,.92))`
- velo hero home (più leggero in alto): `linear-gradient(180deg,rgba(10,14,28,.25) 0%,rgba(10,14,28,.05) 40%,rgba(10,14,28,.88) 100%)`

### Tipografia
- **Display — Archivo, weight 500.** Titoli, nomi soggetto, numeri grandi. Mai maiuscolo forzato.
- **Testo — Work Sans**, weight 300 (paragrafi lunghi), 400 (UI, meta), 500 (link/CTA), 600 (bottone primario).
- **Archivo 800 italic** solo dentro la pill del logo. **Satisfy 400** solo per il wordmark Fabbrica.
- Scala display (px): 58 (hero home) · 46 (hero pagina) · 42 (titolo articolo) · 40 (nome soggetto) · 34 · 32 · 30 · 28 · 24 · 23 · 22 · 21 · 20 · 19 · 18 · 17 · 16
- Scala testo (px): 20 (lead articolo) · 17 · 16.5 (corpo articolo) · 16 · 15.5 · 15 · 14.5 · 14 · 13.5 (nav) · 13 · 12.5 · 12 · 11.5 · 11 · 10.5
- Line-height: titoli 1.1–1.4 (più grande = più stretto); paragrafi 1.6–1.85; corpo articolo 1.85.
- **Letter-spacing** (firma dello stile, non ometterlo):
  `.34em` etichette di sezione maiuscole · `.3em` occhielli hero · `.28em` "SERVICE" ·
  `.2em`/`.18em`/`.16em` tipologie e meta · `.14em` link testuali con freccia · `.12em` bottoni ·
  `.1em`/`.08em` label form e minuterie.
- `text-wrap: pretty` su tutti i titoli multi-riga.

### Spaziature e geometria
- Base 2px, valori usati: 4 5 6 7 8 9 10 12 14 16 18 20 22 24 26 28 30 34 38 40 44 46 52 56 60 64 70 76 80 90.
- **Larghezza pagina mockup 1200px**; gutter laterale **90px** (header/footer 40px; admin 24–34px).
- Colonna di lettura articolo: gutter **210px** (≈780px di testo).
- Griglie: catalogo 4 colonne gap 24px/22px · news 3 colonne gap 34px/24px · correlati 4 colonne gap 20px.
- **Border-radius: 0** su card, bottoni, input, foto. Tondo solo su pill/chip (`999px`) e bullet (`50%`).
- **Nessuna ombra.** La profondità è data da fondi diversi + hairline.
- Altezze foto: hero home 600 · hero pagina 300/320/340 · hero articolo 420 · card catalogo 210 · card news 200 · galleria soggetto 440 + thumb 92 · card istituzionali 220/230.

### Placeholder foto (da sostituire con le immagini reali)
Fondo `#131a30` + `repeating-linear-gradient(45deg, rgba(255,255,255,.045) 0 10px, transparent 10px 20px)`,
etichetta centrata mono 10px su `rgba(8,12,24,.72)`, colore `#93a0c2`.

### Twinkle (unica animazione decorativa)
`@keyframes twk{0%,100%{opacity:.15}50%{opacity:.9}}` — pallini 2–3px, `background:#ffd98a`,
`box-shadow:0 0 6px 1px rgba(255,217,138,.8)`, `animation:twk 3.2s ease-in-out infinite` con delay sfalsati
(0 / .4 / .8 / 1.2 / 1.6 / 2.2s). Presenti su hero e fasce CTA, 2–5 per sezione, posizionati assoluti.
Rispettare `prefers-reduced-motion: reduce` → disattivare.

---

## Struttura del sito e navigazione

Header identico su tutte le pagine pubbliche: pill logo + "SERVICE" a sinistra; a destra
`Chi siamo · Impianti · Luminarie ▾ · Soggetti personalizzati · News · Lavora con noi` + switch `IT / EN`.
Voce attiva in oro. Il menu **Luminarie** è a tendina (nel mockup 1b è mostrato aperto): due colonne,
*Natalizie* / *Eventi*, con le tipologie sotto.

Footer identico su tutte le pagine: 4 colonne (ragione sociale e sede · contatti · pagine · copyright/privacy).
Dati reali da usare: **IME Service srls · Via Adige 238, 37015 Domegliara (VR) · P.IVA 04236040236 ·
Tel. 045 2221396 · Cell. 345 3021563 · info@ime-service.it**.

Rotte suggerite:
`/` · `/chi-siamo` · `/impianti` · `/luminarie?stagione=natalizie|eventi` · `/luminarie/[slug]` ·
`/soggetti-personalizzati` · `/news` · `/news/[slug]` · `/lavora-con-noi` · `/admin/news` · `/admin/news/[id]`.

---

## Screens / Views

### 1. Home — mockup `1a`
**Purpose:** far capire in 5 secondi che l'azienda ha due anime (impianti + luminarie) e portare a preventivo.
**Layout:**
- Hero **600px** full-bleed a scorrimento, 4 slide (01 NATALE · 02 EVENTI · 03 IMPIANTI · 04 LA FABBRICA).
  Frecce circolari 44px (bordo `rgba(255,255,255,.35)`) centrate ai lati a 22px. Indice slide in basso a destra
  (gutter 90px, gap 22px, 11px `.14em`): slide attiva oro con `border-bottom` oro e `padding-bottom:4px`.
  Testo in basso a sinistra a 64px dal fondo: occhiello "DAL 1968 · TRE GENERAZIONI DI LUCE" (11.5px, `.34em`, oro),
  titolo display 58px/1.12 max-width 640px ("Accendiamo la meraviglia."), sottotitolo 17px/1.6 max-width 520px,
  due bottoni ghost (padding 13px 28px, 13px `.12em`): primo con bordo oro e testo oro, secondo bordo bianco 25%.
- **Due anime** (padding 76px 90px 70px): etichetta centrata "DUE ANIME, UNA FAMIGLIA"; poi due pannelli
  `flex:1` (`#10162a` e `#141326`, padding 44px 46px) separati da una colonna 110px che contiene le **onde**
  SVG blu (`#233d92`, stroke 12) e rossa (`#d31f2e`, stroke 8) riprese dalla livrea del furgone
  (`viewBox="0 0 70 340"`, `preserveAspectRatio="none"`, `path d="M48 0 C8 90 66 190 22 340"` e
  `d="M64 0 C24 90 82 190 38 340"`). Ogni pannello: titolo, occhiello `.22em`, 3 bullet con pallino 5px
  (blu / rosso), link oro con freccia.
- **Catalogo soggetti**: titolo 32px + link "SFOGLIA TUTTO IL CATALOGO →"; griglia 3 card (foto 250px, nome
  display 19px, tipologia 11px `.18em` `#8f9ab5`).
- **Dalla Fabbrica**: colonna sinistra 300px (titolo + intro + link) / lista a destra: righe con data 12px
  (larghezza fissa 90px), titolo display 18px `flex:1`, categoria 10.5px `.16em` blu; separatori hairline.
- **Fascia CTA** (margin 0 90px, padding 56px 60px, gradiente, twinkle): titolo 34px, sottotitolo, bottone oro
  pieno (padding 14px 34px, 13px 600 `.12em`, testo `#1a1405`).
- Footer.

### 2. Luminarie — mockup `2a`
**Purpose:** sfogliare il catalogo, filtrato per stagione e tipologia.
- Hero 300px con breadcrumb "HOME / LUMINARIE" (11px `.3em`), titolo 46px, intro 16px max-width 520px.
- **Tab stagione** a piena larghezza sotto l'hero: `NATALIZIE` / `EVENTI`, 14px `.2em`, padding 22px 0, gap 40px;
  attiva oro con `box-shadow: inset 0 -2px 0 #f2c66d`; contenitore con `border-bottom` hairline.
- **Chip tipologia** (padding 8px 16px, radius 999px, 12.5px): attiva fondo oro/testo `#1a1405`, inattive bordo
  `field-border` e testo `#c3cade`. A destra il conteggio ("48 soggetti").
- **Griglia catalogo** 4 colonne, foto 210px, nome display 18px, tipologia 10.5px `.18em`.
- Fascia CTA "Non trovi il soggetto che immagini?" → Soggetti personalizzati. Footer.
**Comportamento:** tab e chip filtrano client-side; lo stato va in querystring (`?stagione=&tipologia=`) per
condivisibilità. Le card sono link a `/luminarie/[slug]`.

### 3. Scheda soggetto — mockup `2b`
**Purpose:** valutare un soggetto e aggiungerlo a una richiesta di preventivo.
- Breadcrumb "LUMINARIE / NATALIZIE / ALBERI DI NATALE" (11px `.26em`).
- Split `gap:52px`, padding 24px 90px 70px: **sinistra** `flex:1` foto principale 440px + 4 thumb 92px
  (`gap:12px`); la thumb selezionata ha `box-shadow: inset 0 0 0 1px #f2c66d`. **Destra** `width:400px`:
  nome display 40px/1.15, tipologia 11px `.2em` oro, descrizione 15.5px/1.7, **scheda tecnica** come lista di
  righe `space-between` (label `#8f9ab5` / valore `#e9ecf6`, padding 13px 0, hairline) — Altezze disponibili,
  Sorgente luminosa, Effetti, Alimentazione, Formula; poi bottone oro `flex:1` "RICHIEDI PREVENTIVO" +
  bottone ghost "+ ALLA RICHIESTA" e una nota 12.5px.
- **"DOVE L'ABBIAMO INSTALLATO"**: 3 card (foto 220px, luogo display 17px, "8 m · Natale 2025" 12px).
- **"Soggetti simili"**: 4 card (foto 170px) + link "TUTTI GLI ALBERI →". Footer.
**Comportamento:** la galleria cambia foto al click sulla thumb. "+ ALLA RICHIESTA" accumula soggetti in una
richiesta multipla (contatore da mostrare nell'header; il mockup non lo disegna — proporre badge sulla voce
"Soggetti personalizzati" o mini-carrello). Precompilare il form preventivo con i soggetti selezionati.

### 4. Soggetti personalizzati — mockup `2c`
**Purpose:** raccogliere una richiesta su misura completa di disegno allegato.
- **Hero split**: sinistra `flex:1` su fondo `#141326` (padding 70px 60px 70px 90px) con wordmark Satisfy 34px,
  titolo 46px/1.14 max-width 420px, testo 16px/1.7 max-width 440px e tre numeri (display 30px oro + label 13.5px):
  "4-6 settimane di produzione", "2D · 3D strutture su misura", "1968 officina di famiglia".
  Destra: foto `width:480px` a piena altezza.
- **"COME FUNZIONA"**: 4 colonne separate da `border-top` 2px — la prima oro, le altre `rgba(255,255,255,.14)`;
  numero 13px `.2em`, titolo display 21px, testo 14px/1.65.
- **Form** (pannello `#10162a`, padding 40px 44px) + **colonna destra 330px** con una foto 230px e una card
  contatti su `#141326`.
  Campi in griglia 2 colonne gap 18px: Nome e cognome*, Azienda o comune, Email*, Telefono, Tipo di soggetto
  (select), Quantità, Misure indicative, Serve per (select). Poi **dropzone** upload (bordo tratteggiato
  `rgba(242,198,109,.55)`, fondo `rgba(242,198,109,.05)`, "+" 24px oro, "JPG, PNG, PDF, AI, DWG · max 20 MB ·
  anche una foto dello schizzo a mano") con riga file caricato + "✕"; textarea Note (h 76px); checkbox privacy
  (quadrato 15px, no radius); bottone oro "INVIA LA RICHIESTA →".
  **Label campo:** 11px, `.1em`, `#8f9ab5`, 7px sotto. **Input:** bordo `field-border`, fondo `field-bg`,
  padding 12px 14px, testo 13px, placeholder `#5f6a86`. Select con "▼" 10px a destra.
**Validazione:** obbligatori nome, email, privacy; email valida; allegato max 20 MB e tipi elencati; almeno uno tra
telefono ed email raggiungibile. Stati richiesti: focus (bordo oro), errore (bordo `#d31f2e` + messaggio 12px),
invio in corso (bottone disabilitato), successo (sostituire il form con un messaggio, non un alert).

### 5. News — mockup `2d`
- Intestazione: occhiello oro "NEWS", titolo 46px "Dalla Fabbrica", intro; a destra chip categoria
  (Tutte / Natale in città / Collezioni / Progetti) con lo stesso stile chip di `2a`.
- **Articolo in evidenza**: riquadro `#10162a` con hairline, foto `width:620px height:360px` a sinistra,
  testo a destra (padding 44px 46px, centrato verticalmente): meta categoria blu + data `#8f9ab5` (11px `.16em`),
  titolo display 32px/1.22, sommario 15.5px/1.7, link oro "LEGGI L'ARTICOLO →".
- **Griglia** 3 colonne × 2 righe: foto 200px, meta 10.5px `.16em`, titolo display 20px/1.3, estratto 14px/1.65.
  Categoria "La Fabbrica" usa `rose` invece di `blue-lt`.
- **Paginazione** centrata: quadrati 38px, corrente oro su `#1a1405`, altri bordo `field-border`, "AVANTI →".

### 6. Articolo — mockup `2e`
- Hero 420px con velo; meta (categoria oro + "12 DICEMBRE 2025 · 4 MIN DI LETTURA"), titolo display 42px/1.18,
  entrambi nel gutter **210px** allineati al fondo (46px).
- Corpo: **lead 20px/1.65** `#e9ecf6`, paragrafi 16.5px/1.85 `#c3cade` (margin-top 20–26px),
  **pull quote** con `border-left:2px solid #f2c66d`, padding-left 26px, display 24px/1.5 bianco + attribuzione
  12px `.18em`, immagine inline 340px con didascalia 12px `#8f9ab5`.
- Tag pill (11.5px `.1em`, bordo `field-border`) su una riga con "CONDIVIDI · FACEBOOK · LINKEDIN · LINK"
  spinto a destra (`margin-left:auto`), sopra un hairline.
- **Prev/next**: 2 card `#10162a`; la successiva allineata a destra.
**Note tecniche:** il corpo arriva dal CMS → serve un renderer che mappi i blocchi consentiti (h2, paragrafo,
citazione, immagine+didascalia, elenco, link) su questi stili. Metadati OG/Twitter e JSON-LD `NewsArticle`.

### 7. Chi siamo — mockup `2f`
- Hero 340px (occhiello "DAL 1968 · TRE GENERAZIONI", titolo 46px).
- Blocco a due colonne `gap:60px`: a sinistra un'affermazione display 30px/1.4, a destra 16px/1.85 con il
  wordmark Fabbrica inline in Satisfy 18px `#ffd9d9`.
- **Timeline** 4 colonne, ciascuna con `border-top` 2px colorato per fase (blu, blu, rosso, oro):
  anno display 32px colorato, titolo 20px, testo 14.5px/1.7 — 1968 · Anni '90 · 2015 · Oggi.
- **Numeri**: fascia con hairline sopra e sotto (padding 44px 0), 4 colonne centrate, display 44px oro +
  label 11.5px `.18em`: 55+ anni · 3 generazioni · 80+ comuni · 100% produzione interna.
  ⚠️ Da confermare con il cliente prima del go-live: sono stime.
- **"DOVE LAVORIAMO"**: 3 card (foto 230px): L'officina · Il magazzino · I mezzi.
- Fascia CTA "Vieni a trovarci in Via Adige 238" → contatti. Footer.

### 8. Impianti — mockup `2g`
- **Hero split** come `2c` ma su `#10162a`, occhiello blu "IME SERVICE · IMPIANTI & TECNOLOGIA", titolo 46px/1.14,
  due bottoni (oro pieno "RICHIEDI UN SOPRALLUOGO" + ghost con il numero di telefono), foto 480px a destra.
- **"COSA FACCIAMO"**: 3 card `#10162a` padding 34px 32px con foto **a filo** in alto (`height:150px` e
  `margin:-34px -32px 26px` per annullare il padding), titolo display 23px, testo 14.5px/1.75:
  Civile e industriale · Noleggio per eventi · Giochi di luce.
- **"COME LAVORIAMO"**: 4 step con `border-top` 2px (primo oro): Sopralluogo · Progetto e preventivo ·
  Realizzazione · Collaudo e manutenzione.
- **"SETTORI"** `flex:1`: righe numerate (01–04, numero 12px blu larghezza 30px, titolo display 19px, nota
  13.5px a destra) separate da hairline; a fianco card 340px su `#141326` che rimanda alle Luminarie.
- Fascia CTA + footer.

### 9. Lavora con noi — mockup `2h`
- Hero 320px, titolo su due righe.
- Due colonne: testo 16px/1.85 · elenco benefici con em-dash oro (14.5px).
- **"POSIZIONI APERTE"**: righe-card `#10162a` padding 28px 32px in colonna `gap:14px`; a sinistra titolo
  display 24px + descrizione 14.5px/1.7, a destra meta 11.5px `.14em` (tipo contratto · sede) e "CANDIDATI →" oro.
  Tre posizioni: Elettricista installatore · Aiuto officina/cablatore · Addetto installazioni stagionale.
- **Candidatura spontanea**: foto 380px a sinistra + form a destra (Nome*, Telefono*, Email*, Ruolo di interesse,
  **CV** dropzone "PDF o DOC · max 10 MB", "Due righe su di te" h 64px, checkbox privacy, bottone oro).
**Comportamento:** "CANDIDATI →" apre il form con il ruolo preselezionato (ancora + query, oppure dialog).

### 10. Admin · lista articoli — mockup `2i`
- Layout `display:flex`, min-height 700px. **Sidebar 230px** su `#080b16` con hairline a destra: logo + "ADMIN",
  voci 13.5px (Dashboard, News, Catalogo soggetti, Richieste preventivo, Candidature, Media, Impostazioni);
  voce attiva oro su `rgba(242,198,109,.08)` con `box-shadow: inset 2px 0 0 #f2c66d`; in fondo l'utente e "Esci".
- Contenuto padding 30px 34px: titolo "News" display 30px + "14 articoli · 2 bozze"; a destra campo di ricerca
  (200px) e bottone oro "+ NUOVO ARTICOLO".
- Tab di stato `TUTTI (14) / PUBBLICATI (12) / BOZZE (2)` (13px `.1em`, attiva oro con inset underline).
- **Tabella** come CSS grid `70px 1fr 150px 120px 110px 130px`: intestazione 10.5px `.16em` `#5f6a86`, righe con
  thumb 54×38, titolo `#e9ecf6`, categoria e data `#8f9ab5`, **badge stato** (BOZZA = bordo oro/testo oro;
  PUBBLICATO = `blue-chip-bg`/`blue-chip-tx`; radius 999px, 11px `.08em`, padding 4px 10px) e azioni
  "Modifica · Elimina" allineate a destra (Modifica oro, Elimina `#8f9ab5`).
- Piede: "1-6 di 14" + paginazione quadrata 32px.
**Comportamento:** ricerca debounce 300ms; ordinamento per data desc con le bozze in cima; Elimina apre una
conferma (modale sullo stesso linguaggio: fondo `#10162a`, hairline, bottone rosso testuale) — mai eliminazione
diretta; ordinamento e filtri in querystring.

### 11. Admin · editor articolo — mockup `2j`
- **Topbar** `#080b16`: "← Articoli", titolo, badge BOZZA; a destra "Salvato 2 min fa" `#5f6a86`,
  "Anteprima", "Salva bozza" (ghost) e **PUBBLICA** (oro pieno, 600).
- **Colonna editor** `flex:1` padding 30px 34px, hairline a destra. Label campo: 10.5px `.2em` `#5f6a86`.
  Campi: Titolo (input con testo display 22px), riga Categoria / Data di pubblicazione / **In evidenza** (toggle
  34×19 radius 999px, oro attivo con pallino 15px `#1a1405`), Immagine di copertina (thumb 190×110 + area
  "Sostituisci · trascina o sfoglia"), Sommario, **Testo** con toolbar (B I U H2 “ ” elenco link immagine) su
  `rgba(255,255,255,.05)` e area 200px, **Tag** pill con "✕" + "+ aggiungi tag".
- **Colonna anteprima 430px** su `#080b16`: intestazione "ANTEPRIMA LIVE" con switch "DESKTOP · MOBILE" oro;
  card che riproduce la resa reale dell'articolo (copertina 150px, meta, titolo 22px/1.28, sommario, incipit);
  sotto, blocco **SEO**: "Titolo pagina · 62/70 caratteri" e "Descrizione · 148/160" con barra 4px
  (fondo `rgba(255,255,255,.1)`, riempimento oro) e URL con slug in oro.
**Comportamento:** autosalvataggio bozza ogni ~30s con timestamp reale; l'anteprima si aggiorna a ogni keystroke
(debounce 200ms) usando **gli stessi componenti** della pagina pubblica, non un secondo markup; slug generato dal
titolo ed editabile; PUBBLICA disabilitato se mancano titolo, categoria, copertina o sommario; contatori SEO
cambiano colore oltre il limite (usare `#d31f2e`).

---

## Interactions & Behavior (riepilogo)
- **Hero home**: carosello 4 slide, autoplay 6s con pausa su hover/focus, frecce + indice cliccabile,
  crossfade 600ms `ease`. Deve essere navigabile da tastiera e non deve muoversi con `prefers-reduced-motion`.
- **Hover** (non disegnato nei mockup, da implementare coerentemente): link oro → `#ffd98a`;
  card catalogo/news → foto `scale(1.03)` 400ms `ease-out` con `overflow:hidden`, titolo passa a oro;
  bottone oro pieno → luminosità -6%; bottone ghost → bordo a piena opacità.
  Transizioni **200ms** per colore/bordo, **400ms** per trasformazioni.
- **Focus visibile obbligatorio**: outline oro 2px offset 2px su tutti gli elementi interattivi.
- **Menu Luminarie**: apertura su hover con delay 120ms su desktop, su click/tap su mobile; chiusura con Esc.
- **Form**: validazione al blur + al submit, messaggi in italiano, stato di invio, conferma inline.
- **Responsive** (i mockup sono solo desktop 1200px — le varianti mobile non sono ancora state disegnate):
  breakpoint suggeriti 1200 / 900 / 640. Regole: gutter 90px → 24px; griglie 4→2→1 e 3→2→1; hero 600→480→380px
  con titolo 58→40→32px; gutter articolo 210px → 24px; hero split e blocchi "due anime" impilati (le onde SVG
  ruotano a orizzontale o si nascondono); nav in drawer a tutta altezza; tab stagione scrollabili orizzontalmente;
  admin: sidebar collassata a icone sotto 1100px, tabella → lista di card sotto 900px.
  **Chiedere conferma al designer prima di improvvisare il mobile.**

## State Management
Nessuno stato globale complesso. Locale per pagina:
- `heroSlide` (index) + timer autoplay — Home.
- `stagione`, `tipologia` (sincronizzati in querystring) — Luminarie.
- `galleryIndex` — Scheda soggetto.
- `richiesta: Soggetto[]` — l'unico stato **condiviso** (contesto + `localStorage`): alimentato da
  "+ ALLA RICHIESTA", consumato dal form preventivo.
- `categoria`, `page` — News.
- Form: react-hook-form (`values`, `errors`, `isSubmitting`, `submitted`), upload con progresso.
- Admin: `query`, `statusFilter`, `page`, `selection`; editor `draft` + `isDirty` + `lastSavedAt` +
  `previewDevice`.
**Dati:** `Article { slug, title, excerpt, body, category, coverImage, tags, status, publishedAt, seoTitle, seoDescription }`
· `Subject { slug, name, tipologia, stagione, description, specs[], gallery[], installations[] }`
· `QuoteRequest` · `JobApplication` · `JobPosting`.

## Assets
- **Foto: nessuna.** Tutti i riquadri sono placeholder con l'etichetta del soggetto richiesto — usare quelle
  etichette come brief fotografico per il cliente. Servono almeno: 4 slide hero, 8 soggetti catalogo,
  4 viste per scheda soggetto, 3 installazioni, 6 foto news, officina/magazzino/mezzi, squadra al lavoro.
- **Loghi: da fornire in SVG** (IME Service e La Fabbrica di Babbo Natale). Nel mockup sono lockup testuali.
- **Onde blu/rosse**: SVG inline, path riportati sopra — riprese dalla livrea dei mezzi.
- **Font**: Archivo, Work Sans, Satisfy (Google Fonts, licenza OFL) — self-hostare in produzione.
- **Icone**: praticamente assenti per scelta (frecce e "▼" sono caratteri). Se servono, usare un set lineare
  sottile 1.5px e non riempirlo di icone: il design vive di tipografia e foto.

## Files
- `Mockup IME Service.dc.html` — canvas con tutti i mockup. **Turno 2** (in cima, opzioni `2a`–`2j`) è la
  direzione approvata; **turno 1** (`1a`–`1p`) contiene la home approvata `1a` e le esplorazioni scartate
  (`1b`–`1p`: direzioni "Brand" e "Mix") — utili solo come storico, **non implementarle**.
- `support.js` — runtime del formato mockup, non serve al progetto React.
- `PROMPT.md` — prompt pronto da incollare in Claude Code.

Per aprire i mockup: aprire il file HTML in un browser. Ogni schermata è etichettata con il suo id (`2a`…`2j`).
