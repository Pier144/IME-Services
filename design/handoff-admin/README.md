# Handoff: area riservata IME Service

## In breve

Ridisegno delle tre pagine di `/admin` del sito IME Service, deciso in cinque giri di
revisione. Tre schermate approvate:

| Rotta | Opzione approvata | Cosa cambia |
|---|---|---|
| `/admin/news` | **6a** | lista a righe invece che a colonne, selezione multipla, barra laterale a sezioni, filtri categoria e anno |
| `/admin/news/[id]` | **2a → 3a** | si scrive dentro l'articolo: niente marcatori, niente anteprima laterale, metadati in un pannello |
| `/admin/login` | **4a** | disegno invariato, si aggiungono gli stati di errore e di blocco |

Scartate e da non implementare: 2b (editor a marcatori vivi), 2c e 5a (lista a tabella),
5b in versione ridotta, 4b (login con twinkle). Restano sul canvas come memoria delle scelte.

---

## I file di questo pacchetto

Sono **riferimenti di design in HTML**: prototipi che mostrano aspetto e comportamento
voluti, non codice di produzione da copiare. Il lavoro è **rifare questi disegni dentro il
codice esistente** (Next.js 16 App Router, React 19, Tailwind v4, i componenti in
`src/components/`), non incollare l'HTML.

- `Area riservata IME.dc.html` — canvas con tutti i turni. Si apre nel browser. In cima i
  turni più recenti; ogni schermata ha un'etichetta (`6a`, `3a`, `4a`…) e sotto una nota
  che spiega la scelta. **Il turno 1 è la ricostruzione fedele dello stato attuale**: serve
  come termine di paragone.
- `Editor articolo.dc.html` — 3a **funzionante**. Si scrive davvero, il «+» aggiunge
  blocchi, la foto si trascina, il salvataggio è simulato con `localStorage`. È la
  specifica di comportamento dell'editor: provalo prima di scrivere codice.
- `support.js` — runtime dei due file sopra. Deve stare nella stessa cartella.
- `foto/` — le sette fotografie usate nei mock, copiate da `public/foto/`.

## Fedeltà

**Alta.** Colori, corpi, interlinee, letter-spacing e spaziature sono quelli veri, presi da
`src/app/globals.css`. Ogni valore scritto qui sotto esiste già come token: **non
introdurre valori nuovi**. Se una misura non è nel design system, è un errore del disegno,
non un permesso.

---

## 1 · `/admin/news` — lista (6a)

### Struttura

```
div.flex.min-h-screen (md:flex-row)
├── AdminSidebar          250px, bg-admin-bg, border-r hairline
└── main                  flex-1, px-24 py-24 lg:px-34 lg:py-30
    ├── intestazione      h1 + conteggio | ricerca, categoria, anno, + NUOVO ARTICOLO
    ├── nav schede        TUTTI / PUBBLICATI / BOZZE + «Seleziona tutti» a destra
    │                     (in selezione: sostituita dalla barra delle azioni)
    ├── ul                una riga per articolo
    └── piede             «1-8 di 14 · 8 per pagina» | paginazione
```

### Barra laterale — `src/components/admin/AdminSidebar.tsx`

Larghezza `md:w-250` (era 230). Le voci si dividono in tre gruppi con un'intestazione
ciascuno:

- Intestazione di gruppo: `px-22 pt-22 pb-8 text-9 font-medium tracking-20 text-ink-4`,
  testo `CONTENUTI` / `RICHIESTE` / `SISTEMA`. Il primo gruppo non ha il `pt-22`.
- Voce: `flex justify-between px-22 py-11` (era `py-12`), `text-13-5 text-ink-3`.
  Attiva: `bg-gold-rail text-gold shadow-rail-active`.
- Numero a destra: `text-ink-3` se la voce è attiva, `text-ink-4` altrimenti.
- Pastiglia oro per le richieste non lette: `rounded-pill bg-gold text-gold-ink px-8 py-1
  text-11 font-semibold`.

Voci: **CONTENUTI** News · Catalogo soggetti · Media — **RICHIESTE** Preventivi ·
Candidature — **SISTEMA** Impostazioni.

> Oggi la barra elenca sette voci di cui sei puntano a pagine che non esistono
> (`/admin/dashboard`, `/admin/soggetti`, `/admin/preventivi`, `/admin/candidature`,
> `/admin/media`, `/admin/impostazioni`). **Una voce senza pagina va tolta**, non lasciata
> morta. Il piede resta com'è (`Accesso come` / email / `Esci`).

### Intestazione

Invariata rispetto a oggi, più due filtri accanto alla ricerca:

- `<Select tone="admin">` categoria — opzioni da `src/data/news-categories.ts`, prima voce
  «Tutte le categorie» (valore vuoto).
- `<Select tone="admin">` anno — anni distinti presenti in `publishedAt`, decrescenti,
  prima voce «Tutti gli anni».

Entrambi scrivono in querystring come già fa `ArticleSearch`: `?categoria=…&anno=…`,
insieme a `q` e `stato`. L'indirizzo resta condivisibile.

### Riga articolo

Sostituisce la griglia `grid-cols-[70px_1fr_150px_120px_110px_130px]`. Diventa:

```jsx
<li className="flex items-center gap-20 border-b border-hairline-soft py-16">
  <input type="checkbox" className="size-15 flex-none …" />
  <PhotoSlot className="h-58 w-88 flex-none" sizes="88px" />
  <span className="min-w-0 flex-1">
    <Link className="block font-body text-17 font-medium text-ink">{titolo}</Link>
    <ArticleMeta size="card" className="mt-6" …/>   {/* 11px, tracking-16 */}
  </span>
  <StatusBadge … />
  <span className="w-110 flex-none text-right …">Modifica · Elimina</span>
</li>
```

- Miniatura **88×58**, `object-cover`.
- Titolo **17px, peso 500, `text-ink`**. Una riga, niente troncamento forzato.
- Riga meta a **11px, `tracking-16`**, elementi separati da `gap-12`:
  categoria · data · «IN EVIDENZA». La categoria prende il colore del mondo, come nel sito
  pubblico: `text-blue-lt` (#7d9bff) di norma, `text-rose` (#e08a8a) per «La Fabbrica».
  Il colore lo decide già `getNewsCategory(slug).tone`. Data in formato breve
  (`formatShortDate`, «12 DIC 2025»), `text-ink-3`. Senza data: `NESSUNA DATA`.
  «IN EVIDENZA» in `text-gold`, solo se `featured`.
- `StatusBadge` invariato.
- Colonna azioni larga `w-110`, allineata a destra. **A riposo mostra solo «Modifica»**;
  «· Elimina» compare su `:hover` e su `:focus-within` della riga. La riga sotto il mouse
  prende `bg-white/2` (`rgba(255,255,255,0.02)`).

Otto articoli per pagina (`PER_PAGE = 8`, era 6). Nel piede compare il selettore
«8 per pagina ▾» con le opzioni 8 / 16 / 32, scritto in querystring come `perPagina`.

### Selezione multipla

Stato client: un `Set` di id. La casella in coda alle schede («Seleziona tutti») seleziona
la pagina corrente.

Quando la selezione non è vuota, **la riga delle schede sparisce** e al suo posto compare
la barra delle azioni — non convivono:

```jsx
<div className="flex items-center justify-between gap-20 border-b border-hairline-strong
                bg-gold-rail px-14 py-11">
  <span className="flex items-center gap-12 text-13 tracking-10 text-gold">✓ 3 SELEZIONATI</span>
  <span className="flex items-center gap-18 text-13 font-medium text-ink-2">
    Pubblica · Riporta in bozza · Cambia categoria ▾ · <b className="text-red">Elimina</b>
    | <span className="text-ink-3">Annulla</span>
  </span>
</div>
```

Righe selezionate: `bg-gold-rail shadow-rail-active` (lo stesso segno della voce attiva in
barra laterale). Casella spuntata: quadrato 15px pieno d'oro con spunta `text-gold-ink`.

**Serve un endpoint nuovo.** `PATCH /api/admin/articoli` con
`{ ids: string[], status?: 'draft'|'published', category?: string }` e
`DELETE /api/admin/articoli` con `{ ids: string[] }`. Stessa validazione della rotta
singola, `revalidatePath` una volta sola alla fine.

### Stati vuoti

**Ricerca senza esiti** — al posto della lista, blocco centrato `py-56`, `border-b border-hairline`:

> **Nessun articolo corrisponde a «zucche».** (15px, `text-ink-2`)
> Prova con meno parole, oppure [azzera la ricerca]. (13.5px, `text-ink-3`, link in oro)

Il termine cercato va in virgolette basse. «Azzera la ricerca» svuota `q` mantenendo gli
altri filtri.

**Archivio vuoto** — `border-t border-hairline-strong`, `py-76`, centrato:

> **Non c'è ancora nessun articolo.** (22px, `text-ink`)
> Le news compaiono in home e nella pagina /news. Il primo articolo può restare in bozza
> finché non è pronto. (15px/1.75, `text-ink-3`, `max-w-440`)
> \[+ NUOVO ARTICOLO\] (`Button variant="gold" size="cta"`, `mt-26`)

Il conteggio sotto l'h1 diventa «Nessun articolo» in `text-ink-4`, e le schede spariscono.

### Conferma di eliminazione

Stessa finestra di `DeleteArticleButton`, estesa alla selezione multipla:

- Titolo: «Eliminare 3 articoli?» (singolare invariato).
- Testo: «L'operazione non si può annullare. Gli articoli spariscono dal sito e
  dall'archivio.»
- Elenco dei titoli, `border-l-2 border-field-border pl-14`, `flex flex-col gap-6`, 15px
  `text-ink-2`. Accanto a ciascun pubblicato: «· pubblicato» in `text-gold`.
- Se almeno uno è pubblicato, riga in più a 13px `text-ink-3`: «Uno dei tre è online:
  sparirà anche da /news.»
- Bottoni invariati: `ghostSoft` Annulla + `danger` Elimina definitivamente.

---

## 2 · `/admin/news/[id]` — editor (3a)

**È la modifica più grossa.** Il prototipo `Editor articolo.dc.html` è la specifica:
aprilo, scrivi, prova il «+», trascina una foto. Quello che fa il prototipo è quello che
deve fare il codice.

### Il cambio di modello

Oggi `ArticleEditor` tiene il corpo come **testo unico con marcatori** (`bodyText`), lo
converte con `textToBlocks` per l'anteprima e con `blocksToText` per rileggerlo. La barra
strumenti scrive marcatori nella `<textarea>`.

Dopo: **si modificano direttamente i blocchi**. Lo stato dell'editor tiene `body:
BodyBlock[]`, quello che il database già salva. Conseguenze:

- `blocksToText` e `textToBlocks` **escono dall'editor**. Restano in `lib/articles/body.ts`
  per la migrazione dei contenuti già scritti e per eventuali importazioni, ma la pagina
  `/admin/news/[id]/page.tsx` smette di chiamare `blocksToText` e passa `article.body`
  così com'è.
- `EditorToolbar.tsx` **si elimina**. Al suo posto il menu del «+» e la barra di
  formattazione sulla selezione.
- `ArticlePreview.tsx` **si elimina**: l'anteprima è la pagina.
- `ArticleBody.tsx` resta e non si tocca: continua a rendere l'articolo pubblico. La
  colonna di scrittura ne replica i corpi in `scale="article"`, così il redattore vede
  esattamente ciò che uscirà.

Il primo blocco di testo va serializzato come `lead`, non `paragraph` — è la regola che
`textToBlocks` applica già con `firstIsLead`. Nella colonna di scrittura il `lead` non si
distingue visivamente: la differenza vive solo nel salvataggio.

### Struttura

```
div.flex.min-h-screen.flex-col
├── header                topbar, bg-admin-bg, border-b hairline, px-26 py-14
├── (avviso)              compare al clic su PUBBLICA quando manca qualcosa
├── div.flex.flex-1
│   ├── colonna scrittura flex-1, centrata, colonna max-w-740, py-64
│   └── aside             320px, bg-admin-bg, border-l hairline — solo se aperto
└── footer                riga di controllo, bg-admin-bg, border-t hairline, px-26 py-14
```

### Topbar

A sinistra invariata: `← Articoli` (`text-ink-3`), filetto `h-16 w-1 bg-rule-step`, titolo
troncato, `StatusBadge`. Il titolo mostra «Nuovo articolo» in `text-ink-4` finché è vuoto.

A destra, `gap-12`, `text-12-5 tracking-08`:

1. stato del salvataggio, `text-ink-4` — «Non ancora salvato» / «Modifiche non salvate» /
   «Salvato ora» / «Salvato N minuti fa»;
2. **Impostazioni** — `Button variant="ghostSoft" size="adminSm"`; quando il pannello è
   aperto passa a `ghostGold` con `bg-gold-rail`;
3. **Salva bozza** — `ghostSoft adminSm`;
4. **PUBBLICA** (o **RIPORTA IN BOZZA** se già pubblicato) — `gold adminSm` / `ghostGold`.

`Anteprima` sparisce: non serve più un'anteprima separata. Per l'articolo già pubblicato
resta utile il collegamento alla pagina vera: mettilo come link discreto nel pannello
Impostazioni, sotto lo slug, non in topbar.

### PUBBLICA non si spegne più

Oggi il pulsante è `disabled` quando mancano titolo, categoria, copertina o sommario, con
una riga grigia sopra la colonna che spiega perché. Dopo: **il pulsante resta acceso**. Al
clic, se manca qualcosa:

- apre il pannello Impostazioni;
- mostra sotto la topbar un avviso `border-b border-gold/40 bg-gold-rail px-26 py-12
  text-13 font-medium text-gold` con il testo «Prima di pubblicare manca: categoria,
  copertina.» — le voci in minuscolo, separate da virgola, chiudibile con ✕;
- nel pannello, le etichette dei campi mancanti passano da `text-ink-4` a `text-gold` e
  prendono un pallino oro da 6px; il campo mancante ha `border-gold`.

**Mai rosso**: non è un errore di chi scrive, è una cosa da finire. Il rosso resta per gli
errori veri (salvataggio fallito, upload rifiutato).

La regola è la stessa di `publishBlockers()` in `lib/validation/article.ts`: non
duplicarla, leggila da lì.

### Colonna di scrittura

Colonna `max-w-740` centrata, contenitore `px-124` (il margine sinistro deve ospitare
etichette e «+» senza tagliarli sotto i 1200px), `pt-64 pb-90`.

Le etichette dei campi stanno **nel margine sinistro**, non dentro riquadri:
`absolute left-[-104px] text-9 font-medium tracking-20 text-ink-4`, testo `TITOLO` e
`SOMMARIO`. Sono decorative: il nome accessibile del campo va dato con `aria-label`.

| Campo | Corpo | Segnaposto |
|---|---|---|
| Titolo | 42px, peso 500, `leading-112`, `text-ink` | «Titolo dell'articolo» |
| Sommario | 20px, `leading-165`, `text-ink` | «Due righe che raccontano l'articolo. Compaiono negli elenchi e nelle anteprime condivise.» |

Sotto il sommario, filetto `h-1 bg-hairline` a `mt-34`. Poi i blocchi, `mt-26` l'uno
dall'altro.

Tutti i campi sono `<textarea>` che crescono da sole (`height:auto` poi `scrollHeight`),
senza bordo, senza fondo, senza raggio: la pagina è un foglio.

### I blocchi

Stessi corpi di `ArticleBody` con `scale="article"`:

| Blocco | Resa nella colonna |
|---|---|
| `lead` / `paragraph` | 17px, `leading-185`, `text-ink-2` |
| `heading` | 28px display, peso 500, `text-ink`, `mt-14` in più |
| `quote` | `border-l-2 border-gold pl-26 py-6`, 24px display, `leading-150`, `text-white`; sotto, filetto `h-1 w-16` + attribuzione 12px `tracking-18 text-ink-3` maiuscola |
| `list` | una voce per riga, trattino oro `h-1 w-12` a `-top-4`, testo 17px `leading-170 text-ink-2`, `gap-10` |
| `image` | `PhotoSlot` a piena colonna, `h-340`; sotto due righe: didascalia e descrizione |

Le virgolette «» della citazione le mette il renderer, non il redattore: nella colonna di
scrittura si scrive il testo nudo.

### Tastiera

- **Invio** in un paragrafo o in un titolo: chiude il blocco e ne apre uno nuovo di tipo
  paragrafo, con il cursore dentro.
- **Maiusc+Invio**: a capo dentro lo stesso blocco.
- **Invio** in una voce di elenco: nuova voce.
- **Backspace** su blocco vuoto: elimina il blocco e porta il cursore in fondo al
  precedente. Su voce di elenco vuota: elimina la voce; se era l'unica, elimina il blocco.
- L'ultimo blocco non si elimina mai: resta un paragrafo vuoto.

### Il «+»

Quadrato 26×26 nel margine (`left-[-46px]`), `border border-field-border text-ink-3`,
`hover:border-gold hover:text-gold`. Inserisce **sotto** il blocco a cui è affiancato.

Al clic si apre il menu: `w-300 border border-hairline-strong bg-panel-ime py-8`,
intestazione `AGGIUNGI` (`px-18 py-8 text-9 tracking-20 text-ink-4`), poi cinque voci
`px-18 py-10`, `hover:bg-gold-rail`:

| Voce | Riga di spiegazione |
|---|---|
| Testo | Un paragrafo normale |
| Titolo di sezione | Divide l'articolo in parti |
| Citazione | Con attribuzione, filetto oro |
| Elenco puntato | Trattini oro, una voce per riga |
| Foto | Immagine a tutta colonna con didascalia |

Nome 14px peso 500 `text-ink`, spiegazione 12px `text-ink-4` a `mt-2`. Il menu si chiude
su Esc, al clic fuori, e dopo la scelta. Il blocco nuovo riceve il fuoco.

Navigabile da tastiera: frecce su/giù fra le voci, Invio per scegliere.

### Foto

La foto entra **nel punto dell'articolo in cui deve stare**. Niente `window.prompt`: le
due finestre di sistema che oggi chiedono indirizzo e didascalia spariscono.

Blocco vuoto: area tratteggiata `border border-dashed border-gold-dash bg-gold-veil
px-20 py-34`, con «＋», «Trascina qui la foto oppure [sfoglia]» e «JPG, PNG, WEBP ·
massimo 8 MB» (il limite è `uploadLimits.cover` in `lib/site.ts`). Accetta il
trascinamento. Il caricamento passa da `/api/upload` con `kind: 'cover'`, come oggi.

Sotto la foto, due righe sole, senza riquadro, `border-b border-field-border py-8 text-13`:

- **Didascalia (facoltativa)** → `block.caption`
- **Descrizione per chi non vede la foto** → `block.label`

`label` è già il campo che `PhotoSlot` mostra come segnaposto quando la foto manca e che
finisce nell'`alt`: tenerlo lì, accanto alla foto, è il modo per non dimenticarlo. Se
resta vuoto, al salvataggio si scrive `FOTO: da definire` come fa già `textToBlocks`.

### Barra di formattazione sulla selezione

Compare **sopra** il testo selezionato, mai sopra la selezione stessa, dentro la colonna:
`border border-hairline-strong bg-panel-ime px-14 py-9`, `gap-16`, `text-13 text-ink-2`.

Voci: **B** · *I* · U · filetto · Titolo · Citazione · Elenco · Link (in oro).

I primi tre applicano i marcatori inline che `renderInline` già conosce (`**`, `*`, `__`)
attorno alla selezione. «Titolo», «Citazione», «Elenco» **convertono il blocco corrente**.
«Link» apre un campo in linea per l'indirizzo — non un `prompt`.

### Pannello Impostazioni

`aside` da 320px, `bg-admin-bg`, `border-l border-hairline`, `px-24 py-22`. **Parte
chiuso.** Intestazione `IMPOSTAZIONI` (10.5px `tracking-20 text-ink-4`) con ✕ a destra.

Nell'ordine: copertina (segnaposto tratteggiato `h-130` che accetta il trascinamento) ·
categoria (`Select tone="admin"`) · data + in evidenza affiancati · tag (pastiglie
esistenti) · slug · **SEO** dopo un `border-t border-hairline-strong pt-18`: i due
contatori con barra (invariati, `seoLimits` da `lib/site.ts`) e l'URL con lo slug in oro.

Le etichette usano `FieldLabel tone="admin"`.

Sotto i 1200px il pannello diventa un pannello sovrapposto a destra, largo 320px, con velo
`bg-night/80` dietro; sotto i 900px occupa tutta la larghezza. **Il resto del responsive
non è disegnato: vedi «Cose aperte».**

### Riga di controllo in fondo

`border-t border-hairline bg-admin-bg px-26 py-14`, `gap-22`, `text-12-5 font-medium
text-ink-4`. Quattro voci — Titolo, Sommario, Categoria, Copertina — ciascuna con un
cerchio da 14px: vuoto (`border border-field-border`) se manca, pieno d'oro con spunta
`text-gold-ink` se c'è. A destra, allineato in fondo: «N parole · N minuti di lettura»
(`readingMinutes` in `lib/articles/body.ts`).

### Salvataggio

Invariato nella sostanza: `PATCH /api/admin/articoli/[id]`, salvataggio automatico dopo
l'ultima modifica, `beforeunload` se ci sono modifiche pendenti. Due differenze:

- il corpo va nel payload come `body: BodyBlock[]`, non più `bodyText: string`. La rotta
  deve accettare i blocchi e validarli con `parseBlock`, che esiste già;
- l'attesa scende da 30 s a **1,2 s dopo l'ultimo tasto**: si scrive in un foglio, e un
  foglio non aspetta mezzo minuto. `updatedAt` continua ad arrivare dalla risposta del
  server, non dall'orologio del browser.

---

## 3 · `/admin/login` (4a)

**Il disegno non cambia.** Cambia il comportamento: oggi `LoginForm` mostra sempre
`t.admin.login.error` («Email o password non corretti.») qualunque cosa risponda il
server, quindi chi è bloccato dal limitatore continua a provare senza capire.

`/api/auth/login` risponde già **429** con «Troppi tentativi. Riprova fra qualche minuto.»
e l'intestazione `Retry-After`. Vanno distinti tre stati:

**Riposo** — invariato.

**Errore (401)** — i due campi prendono `border-red`; sotto, riquadro
`border border-red px-14 py-10 text-13 leading-160 text-red`:

> Email o password non corretti.
> *Restano 3 tentativi.* (`text-ink-3`)

Il conteggio arriva dal limitatore: aggiungi `remaining` alla risposta 401. Il messaggio
resta unico per email e password — non si dice mai quale delle due è sbagliata.

**Blocco (429)** — i campi vanno a `opacity-45` e diventano `disabled`, il pulsante pure;
riquadro **in oro**, non in rosso, `border border-gold text-gold`:

> Troppi tentativi. Riprova fra qualche minuto.
> *Puoi riprovare alle 14:52.* (`text-ink-3`)

L'ora si calcola da `Retry-After`. Alla scadenza il modulo si riabilita da solo.

---

## Token

Tutti già in `src/app/globals.css`. Nessuno nuovo.

Fondi `--color-night` #0a0e1c · `--color-panel-ime` #10162a · `--color-admin-bg` #080b16 ·
`--color-photo-bg` #131a30
Testo `--color-ink` #e9ecf6 · `--color-ink-2` #c3cade · `--color-ink-3` #8f9ab5 ·
`--color-ink-4` #5f6a86
Azione `--color-gold` #f2c66d · `--color-gold-hover` #ffd98a · `--color-gold-ink` #1a1405 ·
`--color-gold-rail` rgba(242,198,109,.08) · `--color-gold-veil` · `--color-gold-dash`
Mondi `--color-blue-lt` #7d9bff · `--color-rose` #e08a8a · `--color-blue-chip-bg` /
`--color-blue-chip-tx` · `--color-red` #d31f2e
Filetti `--color-hairline-soft` .06 · `--color-hairline` .08 · `--color-hairline-strong` .1 ·
`--color-rule-step` .14 · `--color-field-border` .16 · `--color-ghost-soft` .2 ·
`--color-check` .3 · `--color-field-bg` .03
Filetti inset `--shadow-rail-active` (voce e riga attive) · `--shadow-tab-active` (scheda)

`--spacing: 1px`, quindi `py-16` sono 16px. Raggio 0 ovunque tranne `rounded-pill`.
Nessuna ombra. I `tracking` sulle maiuscole non si omettono mai.

## Fotografie

Le sette in `foto/` vengono da `public/foto/` del progetto: sono stock provvisorie
(Pexels), mappate in `src/data/photos.ts` e documentate in `CREDITI-FOTO.md`. Servono solo
a popolare i mock. Nel codice si continua a passare da `<PhotoSlot>`.

## Cose aperte

1. **Responsive sotto i 1200px** — non disegnato, tranne la regola del pannello
   Impostazioni. Da definire prima di implementare: come si comportano le righe della
   lista a 900px (la riga meta va sotto? le azioni?), e la colonna di scrittura a 640px.
2. **Endpoint in blocco** — `PATCH` e `DELETE` su `/api/admin/articoli` non esistono.
3. **Media** — «Carica o scegli dai Media» presuppone una libreria che non c'è. Se non si
   fa, resta solo «Carica».
4. **Migrazione dei contenuti** — i 14 articoli del seed sono già blocchi, quindi non c'è
   nulla da convertire. Se nel frattempo qualcuno ha scritto con i marcatori, il testo è
   già stato salvato come blocchi al primo salvataggio: `textToBlocks` gira lato server.
5. **Sezioni nuove** (Catalogo soggetti, Media, Preventivi, Candidature, Impostazioni) —
   sono in barra laterale nel disegno ma le pagine non esistono. Vanno tolte finché non si
   fanno, oppure vanno fatte.

## File

- `Area riservata IME.dc.html` — canvas completo, turni 1→6
- `Editor articolo.dc.html` — prototipo funzionante dell'editor (3a)
- `support.js` — runtime, deve stare accanto ai due file
- `foto/` — sette immagini
- `PROMPT.md` — da incollare in Claude Code per cominciare
