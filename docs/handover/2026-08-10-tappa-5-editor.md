# Handover — l'area riservata dopo la Tappa 5

**Data:** 10 agosto 2026 · **Ramo:** `main` · **Tappe fatte:** 1, 2, 3, 4, 5 su 5

Questo documento serve a chi riprende il lavoro in una sessione nuova, senza il contesto della
precedente. La specifica resta un'altra: sta in
[`design/handoff-admin/README.md`](../../design/handoff-admin/README.md). Qui c'è solo quello che
quella specifica non può sapere.

**Le cinque tappe del ridisegno sono chiuse e stanno su `main`.** Il ramo di lavoro
`redesign-admin` è stato riassorbito in fast-forward e cancellato: la sua storia è quella di `main`.

**Attenzione a una cosa**: il ridisegno è arrivato su `main` *prima* della prova a video, che
richiede una persona con una sessione vera. È stata una scelta consapevole — il sito non è ancora
pubblicato su un dominio vero — ma resta il primo lavoro da fare, e finché non è fatto `main` non è
un ramo su cui contare. Vedi «Cosa resta».

---

## Leggi questo prima di scrivere codice

### 1. L'editor ricco è già stato provato e abbandonato

Esiste un ramo `editor-ricco` con TipTap montato e funzionante, più due convertitori fra
`BodyBlock[]` e il documento dell'editor. **È stato abbandonato di proposito.**

Il motivo: il design approvato (3a) è un **editor a blocchi**, in cui si modificano direttamente i
`BodyBlock[]`. Il README dell'handoff elenca fra le opzioni scartate *«2b, editor a marcatori
vivi»*, e il prompt originale chiude con **«Non inventare una terza strada: le alternative sono già
state valutate e scartate»**. Una libreria di editor ricco è, precisamente, la terza strada.

**Non reintrodurre TipTap.** Se sembra la soluzione ovvia, è perché lo è in generale — non qui.
L'editor a blocchi adesso c'è, funziona e sta in poco più di mille righe: la libreria non serve più
nemmeno come scorciatoia.

### 2. L'ordine delle chiavi era rotto in tre modi, ora ha una porta sola

La colonna `body` conserva `JSON.stringify(blocks)`: due liste con gli stessi dati ma le chiavi in
ordine diverso danno stringhe diverse, e l'articolo si riscrive a ogni salvataggio — `updatedAt`
sporcato e pagine pubbliche rigenerate per niente. `toEqual` non se ne accorge: va confrontata la
stringa serializzata.

Il blocco `image` esisteva in **tre ordini diversi**: `{type,label,caption}` dal seed,
`{type,label,src,caption}` da `textToBlocks`, `{type,label,caption,src}` da `parseBlock`.

La cura è `normalizeBody` in [`src/lib/articles/body.ts`](../../src/lib/articles/body.ts): rimette
ogni blocco nella forma canonica di `parseBlock` e riapplica la regola del `lead`. È **idempotente**
ed è chiamata dentro `articlePayloadSchema`, non dalle rotte: così nessuna scrittura può saltarla.

**Se aggiungi un tipo di blocco, o un campo a un blocco esistente, il posto da toccare è
`parseBlock` — e i test in `body.test.ts` vanno estesi.** Qualunque altra strada rimette in piedi il
problema.

### 3. Le foto dipendono da R2, che è configurato ma non in produzione

R2 funziona **in locale**: verificato con un caricamento vero attraverso `/api/upload`, file salvato
nel bucket, riletto con link firmato, e `/api/media/…` che risponde 404 a chi non ha sessione.

**Su Netlify le variabili dello storage non sono ancora impostate** — `STORAGE_DRIVER` va portato a
`"s3"`, e servono `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`,
`S3_SECRET_ACCESS_KEY` (l'elenco commentato sta in `.env.example`). Finché non ci sono, ogni
caricamento fallisce — comprese le foto nel corpo dell'articolo, che nella Tappa 5 sono diventate
una funzione centrale. `STORAGE_DRIVER` da solo non basta e viceversa: il driver locale scrive su
disco, e sull'hosting il disco è di sola lettura.

Attenzione all'endpoint: il bucket è nella **giurisdizione EU**, quindi l'indirizzo contiene `.eu.`
(`https://<account>.eu.r2.cloudflarestorage.com`). Sull'endpoint normale R2 risponde `AccessDenied`
anche con credenziali perfette. La giurisdizione è un'altra cosa dal *location hint*, che invece
l'endpoint non lo cambia.

---

## Lo stato reale del codice

| Cosa | Stato oggi |
| --- | --- |
| `articlePayloadSchema` | riceve `body: BodyBlock[]`, validato blocco per blocco |
| `normalizeBody` | unica porta delle scritture, dentro lo schema |
| `textToBlocks` · `blocksToText` | restano in `lib/articles/body.ts`, **fuori** dall'editor |
| `EditorToolbar.tsx` · `ArticlePreview.tsx` | eliminati |
| `ArticleBody.tsx` | non toccato: rende la pagina pubblica e detta i corpi all'editor |
| TipTap | non installato, e non va installato |
| Vitest | installato · `npm run test` · 50 test |

### Cosa è stato fatto, tappa per tappa

- **Tappa 1** (`2651aef`) — lista a righe, barra laterale a gruppi larga 250px, filtri categoria e
  anno, otto per pagina con selettore 8/16/32. Tutti i filtri in querystring.
- **Tappa 2** (`634e1ca`) — selezione multipla, barra delle azioni che sostituisce le schede,
  `PATCH` e `DELETE` su `/api/admin/articoli`, finestra di conferma unica per riga singola e
  selezione.
- **Tappe 3 e 4** (`7883bef`) — stati vuoti (archivio, ricerca, filtri) e accesso che distingue 401
  da 429.
- **Tappa 5** (`7c75e80`) — l'editor a blocchi. Vedi sotto.

La lista è un componente client (`ArticleList.tsx`) perché la selezione è stato dell'interfaccia; la
pagina resta un componente server.

### La Tappa 5 in dettaglio

**Il giro dei dati.** `page.tsx` passa `article.body` così com'è; l'editor tiene
`EditorBlock[]` (i blocchi più un `id` che serve solo a React e al fuoco, e che non arriva mai al
database); il salvataggio manda `body: BodyBlock[]`. La rotta non chiama più `textToBlocks`.

**I file nuovi:**

| File | Cosa fa |
| --- | --- |
| `lib/articles/editor-blocks.ts` | tutta la logica pura: conversioni, tastiera, inserimento, conversione di tipo |
| `lib/articles/inline-marks.ts` | i marcatori `**`, `*`, `__` e i link applicati a una selezione |
| `components/admin/editor/BlockField.tsx` | un blocco a video, nei corpi di `ArticleBody` |
| `components/admin/editor/AddBlockMenu.tsx` | il «+» nel margine e il suo menu |
| `components/admin/editor/SelectionToolbar.tsx` | la barra sulla selezione |
| `components/admin/editor/SettingsPanel.tsx` | il pannello da 320px |
| `components/admin/editor/PhotoPicker.tsx` | caricamento e riuso delle foto |
| `components/admin/editor/useBlockFocus.ts` | il fuoco che salta da un blocco all'altro |
| `components/admin/editor/AutoTextarea.tsx` | il campo che cresce con il testo |
| `components/admin/editor/draft.ts` | il tipo dell'articolo in scrittura, condiviso con il pannello |

**Perché `draft.ts` esiste**: il pannello modifica una fetta dell'articolo, e `PanelDraft` è un
`Pick` di `EditorArticle`. Derivarla da lì è ciò che permette di passargli la stessa funzione di
aggiornamento senza forzature di tipo. Se separi di nuovo i due tipi, TypeScript ricomincia a
protestare sulla varianza dei generici.

**Perché le modifiche al testo usano la forma funzionale** (`setBlocks(current => …)`) mentre quelle
alla struttura no: chi scrive veloce può produrre due battute prima che React abbia riportato lo
stato nel componente, e partire da una lista vecchia farebbe sparire il carattere in mezzo. Le
operazioni di struttura invece devono calcolare *dove va il cursore*, e per farlo hanno bisogno
della lista corrente nel gestore dell'evento.

---

## Decisioni prese che vanno oltre il disegno

Sono già state discusse e approvate: non rimetterle in discussione senza motivo.

### Dalle tappe 1–4

- **Barra laterale**: l'handoff disegna sei voci in tre gruppi e due righe dopo dice di togliere le
  voci senza pagina. Il codice tiene la struttura a gruppi ma mostra solo quelli con voci vive: oggi
  si vede `CONTENUTI · News`.
- **Pubblicazione multipla**: tutto o niente. Se anche un solo articolo della selezione non è
  pubblicabile, l'operazione non parte e il messaggio nomina quali e cosa manca a ciascuno.
- **Rigenerazione**: le pagine di elenco si rigenerano una volta sola, ma le pagine dei singoli
  articoli vanno nominate a una a una, altrimenti restano in cache col contenuto vecchio.
- **Terzo stato vuoto**: filtri attivi senza ricerca testuale. L'handoff non lo copre, ma succede.
- **Accesso**: al quinto errore restano zero tentativi, e «Restano 0 tentativi» non aiuta nessuno:
  quel caso dice che al prossimo errore l'accesso si blocca.

### Dalla Tappa 5

- **Responsive**: sotto i 900px (`--breakpoint-md`) l'editor **avvisa ma lascia scrivere**. La
  colonna passa da `px-124` a `px-56` e le etichette nel margine spariscono — a quella larghezza non
  ci stanno — ma il «+» resta. Le pagine di elenco restano usabili a ogni larghezza.
- **Media**: nessuna pagina `/admin/media`. Le foto già usate si ricavano dai blocchi `image` degli
  articoli e dalle copertine (`listUsedImages` nel repository) e si riusano con un clic, **sia nel
  corpo sia in copertina**. Nessun modello dati nuovo. L'elenco non ha un tetto: con 14 articoli va
  bene, oltre il centinaio va paginato.
- **Barra di formattazione sulla selezione**: il README la specifica per intero, il prototipo non ce
  l'ha. Vince il README, che è la fonte di verità; il prototipo resta il metro del *comportamento di
  scrittura*.
- **Invio non spezza il testo al cursore**: apre un paragrafo vuoto sotto. È quello che fa il
  prototipo, ed è quello che serve a chi preme Invio in fondo a una frase.
- **Backspace sopra un elenco** porta il cursore all'**ultima** voce: il README dice «in fondo al
  precedente», il prototipo va alla prima. Ha vinto il README.
- **«Togli la foto»** su foto e copertina. Non è disegnato, ma senza, una foto messa non si può più
  togliere: il blocco non è vuoto, quindi Backspace non lo elimina.
- **La descrizione della copertina resta.** Il README elenca i campi del pannello e la salta, ma è
  l'`alt` della copertina sulla pagina pubblica: toglierla è una regressione di accessibilità.
- **`router.refresh()` solo se cambiano slug o stato.** Conseguenza diretta del salvataggio a 1,2 s:
  a quella frequenza rileggere la lista a ogni pausa di battitura è uno spreco.
- **«Non ancora salvato» non è implementato**: la riga esiste già quando l'editor si apre — la crea
  il `POST` del pulsante «nuovo articolo» — quindi lo stato è irraggiungibile. Non è una svista.

---

## Infrastruttura

| | |
| --- | --- |
| Repository | `Pier144/IME-Services` — due rami: `main` e `editor-ricco` (memoria, vedi §1) |
| Anteprima | <https://imeservice.netlify.app> — segue `main`. Non è ancora il sito pubblicato: il dominio vero non punta qui |
| Database | Neon, progetto `Ime-Service`, `steep-wildflower-26907178`, Francoforte, 14 articoli |
| Storage | Cloudflare R2, bucket `allegati`, giurisdizione EU, privato |
| MCP Neon | configurato in `.mcp.json`, **sola lettura**, vincolato al progetto |

Tutto sta su **account personali** e andrà spostato su account intestati a IME Service prima del
go-live.

Restano aperti, indipendenti da questo lavoro: la regione delle funzioni Netlify da portare a
Francoforte (il default è Ohio, e il database è a Francoforte), le variabili `S3_*` su Netlify, il
dominio vero con `NEXT_PUBLIC_SITE_URL` allineata, e le notifiche email (oggi `MAIL_DRIVER=console`,
quindi nessuno riceve niente).

**Fuori perimetro ma più grave di tutto il resto:** le richieste di preventivo e le candidature
finiscono nel database e **nessuno le vede**. Non esiste una pagina per leggerle e non parte nessuna
notifica.

---

## Cosa resta

1. **La prova a video dell'editor.** È il primo lavoro, e il codice è già su `main`. Le pagine
   dell'area riservata richiedono una sessione, e chi lavora in una sessione automatica non può
   inserire password nei form: Invio, Backspace, il fuoco che salta di blocco, il «+», il
   trascinamento della foto e la barra sulla selezione **li deve provare una persona**. I test
   coprono la logica sotto, non il rendering.
2. **Le cinque variabili dello storage su Netlify** — `STORAGE_DRIVER="s3"`, `S3_ENDPOINT`,
   `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Senza, sull'anteprima
   nessuna foto si carica: né le copertine, né quelle nel corpo dell'articolo.
3. **Le sezioni ancora inesistenti** (Catalogo soggetti, Preventivi, Candidature, Impostazioni):
   sono in barra laterale nel disegno ma le pagine non ci sono, e la barra oggi mostra solo
   `CONTENUTI · News`.

---

## Trappole operative

- **`npm run build` fallisce con `EPERM` se il server di sviluppo è avviato.** Tiene bloccato il
  motore Prisma su Windows. Fermare il server e ribuildare.
- **Nei log del server compare `SyntaxError: Unexpected end of JSON input` sulla pagina `/it`.** È
  preesistente, compare una volta sola all'avvio, le pagine rispondono 200.
- **`npm run check:storage`** verifica R2 per intero: scrive, rilegge con link firmato, confronta il
  contenuto e controlla che il bucket sia privato.
- **La configurazione di Vitest è `vitest.config.mts`, non `.ts`**: con l'estensione `.ts` Vite
  avvisa che il file usa sintassi ESM ma viene caricato come CommonJS. Per questo `tsconfig.json`
  include anche `**/*.mts`, altrimenti la configurazione resterebbe fuori dal `typecheck`.
- **Il dizionario italiano detta la forma di quello inglese** (`src/i18n/types.ts`): una chiave
  aggiunta in `it.ts` e non in `en.ts` è un errore di tipo, non un testo mancante.

---

## Come si verifica

```bash
npm run test && npm run typecheck && npm run lint && npm run build
```

E, per il comportamento, il server di sviluppo con una sessione vera:

```bash
npm run dev
```

I test coprono la logica pura: stabilità della serializzazione, regole da tastiera, marcatori in
linea, e il contratto fra quello che l'editor manda e quello che la rotta accetta. Sono le cose che
si rompono in silenzio e che a mano si provano male.

---

## Storia

Il prompt con cui è stata aperta la Tappa 5 sta in
[`2026-08-10-prompt-tappa-5.md`](2026-08-10-prompt-tappa-5.md), accanto a questo file.
