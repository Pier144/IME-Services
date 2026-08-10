# Handover — Tappa 5: l'editor dell'area riservata

**Data:** 10 agosto 2026 · **Ramo:** `redesign-admin` · **Tappe fatte:** 1, 2, 3, 4 su 5

Questo documento serve a chi riprende il lavoro in una sessione nuova, senza il contesto della
precedente. La specifica da implementare è un'altra: sta in
[`design/handoff-admin/README.md`](../../design/handoff-admin/README.md), sezione **2 ·
`/admin/news/[id]` — editor (3a)**. Qui c'è solo quello che quella specifica non può sapere.

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

Il ramo resta su GitHub come memoria. Da lì può valere la pena guardare una cosa sola: il file
`src/lib/articles/tiptap.test.ts`, che documenta un errore reale trovato dai test (l'ordine delle
chiavi nella serializzazione, vedi «Trappole» più sotto).

### 2. Due domande vanno decise con il committente, prima di cominciare

Il prompt originale le indica esplicitamente come «cose che il design non copre e che vanno decise
insieme»:

1. **Il responsive sotto i 1200px**, a parte la regola del pannello Impostazioni che il README
   descrive.
2. **La libreria Media**: farla davvero, oppure lasciare solo «Carica».

Alla data di questo handover **non hanno ancora risposta**. Chiederle prima di progettare la
struttura, non dopo.

### 3. Le foto trascinabili dipendono da R2, che è configurato ma non in produzione

R2 funziona **in locale**: verificato con un caricamento vero attraverso `/api/upload`, file salvato
nel bucket, riletto con link firmato, e `/api/media/…` che risponde 404 a chi non ha sessione.

**Su Netlify le variabili `S3_*` non sono ancora impostate.** Finché non lo sono, in produzione ogni
caricamento fallisce. La sotto-tappa delle foto si può quindi sviluppare e provare in locale, ma non
si può considerare finita finché quelle variabili non sono sul pannello.

Attenzione all'endpoint: il bucket è nella **giurisdizione EU**, quindi l'indirizzo contiene `.eu.`
(`https://<account>.eu.r2.cloudflarestorage.com`). Sull'endpoint normale R2 risponde `AccessDenied`
anche con credenziali perfette. La giurisdizione è un'altra cosa dal *location hint*, che invece
l'endpoint non lo cambia.

---

## Lo stato reale del codice

Sul ramo `redesign-admin` **l'editor non è ancora stato toccato**. Verificato:

| Cosa | Stato oggi |
| --- | --- |
| `articlePayloadSchema` | riceve ancora `bodyText: string` |
| `textToBlocks` · `blocksToText` | esistono ancora in `lib/articles/body.ts` |
| `EditorToolbar.tsx` | esiste (l'handoff dice di eliminarlo) |
| `ArticlePreview.tsx` | esiste (l'handoff dice di eliminarlo) |
| TipTap | non installato |
| Vitest | non installato |

Quindi la sezione «Il cambio di modello» del README descrive esattamente il punto di partenza: si
comincia da lì, senza dover disfare niente.

### Cosa è stato fatto nelle tappe 1–4

- **Tappa 1** (`2651aef`) — lista a righe, barra laterale a gruppi larga 250px, filtri categoria e
  anno, otto per pagina con selettore 8/16/32. Tutti i filtri in querystring.
- **Tappa 2** (`634e1ca`) — selezione multipla, barra delle azioni che sostituisce le schede,
  `PATCH` e `DELETE` su `/api/admin/articoli`, finestra di conferma unica per riga singola e
  selezione.
- **Tappe 3 e 4** (`7883bef`) — stati vuoti (archivio, ricerca, filtri) e accesso che distingue 401
  da 429.

La lista è diventata un componente client (`ArticleList.tsx`) perché la selezione è stato
dell'interfaccia; la pagina resta un componente server.

### Decisioni prese che vanno oltre il disegno

Sono già state discusse e approvate: non rimetterle in discussione senza motivo.

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

---

## Infrastruttura

| | |
| --- | --- |
| Repository | `Pier144/IME-Services` |
| Produzione | <https://imeservice.netlify.app> — segue `main`, **non** `redesign-admin` |
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

## Trappole operative

- **`npm run build` fallisce con `EPERM` se il server di sviluppo è avviato.** Tiene bloccato il
  motore Prisma su Windows. Fermare il server e ribuildare.
- **Nei log del server compare `SyntaxError: Unexpected end of JSON input` sulla pagina `/it`.** È
  preesistente, compare una volta sola all'avvio, le pagine rispondono 200. Non è stato introdotto
  dalle tappe 1–4.
- **`npm run check:storage`** verifica R2 per intero: scrive, rilegge con link firmato, confronta il
  contenuto e controlla che il bucket sia privato.
- **L'ordine delle chiavi conta.** La colonna `body` salva `JSON.stringify(blocks)`. Se una funzione
  ricostruisce un blocco mettendo le chiavi in ordine diverso da `parseBlock`, la stringa cambia
  anche a dati identici: l'articolo si riscrive a ogni apertura, `updatedAt` si sporca e le pagine
  si rigenerano per niente. `toEqual` non se ne accorge — va confrontata la stringa serializzata.
  Questo errore è già stato commesso una volta, sul ramo abbandonato.
- **Verifica visiva:** le pagine dell'area riservata richiedono una sessione. Chi lavora in una
  sessione automatica non può inserire password nei form, quindi la prova a video la deve fare una
  persona. Restano verificabili da fuori: i codici di risposta, la validazione delle API, il
  comportamento del limitatore con credenziali sbagliate.

---

## Come si verifica una tappa

```bash
npm run typecheck && npm run lint && npm run build
```

E, per il comportamento, il server di sviluppo con una sessione vera:

```bash
npm run dev
```

Per la Tappa 5 conviene reintrodurre **Vitest** (era sul ramo abbandonato): le regole da tastiera —
Invio che spezza il blocco, Maiusc+Invio che va a capo dentro, Backspace che elimina il blocco
vuoto, l'ultimo blocco che non si cancella mai — sono logica pura, si rompono in silenzio e si
provano male a mano.

---

## Il prompt per la sessione nuova

Sta in [`2026-08-10-prompt-tappa-5.md`](2026-08-10-prompt-tappa-5.md), accanto a questo file.
