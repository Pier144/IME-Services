# Prompt per la sessione nuova — Tappa 5

Da incollare in Claude Code aperto sulla cartella del progetto.

---

Lavoriamo sull'area riservata di questo progetto. Siamo alla **Tappa 5 di 5**: l'editor articolo
(`/admin/news/[id]`). Le tappe 1–4 sono già fatte e in `redesign-admin`, che è il ramo su cui
continuare — **non** `main`, che alimenta la produzione.

**Prima di scrivere codice, leggi in quest'ordine:**

1. `docs/handover/2026-08-10-tappa-5-editor.md` — cosa è successo finora, cosa è già stato provato e
   scartato, e le trappole. **Leggilo per primo:** contiene almeno una cosa che ti farebbe perdere
   mezza giornata.
2. `design/handoff-admin/README.md`, sezione **2 · `/admin/news/[id]` — editor (3a)**. È la
   specifica, ed è la fonte di verità.
3. `design/handoff-admin/Editor articolo.dc.html` — aprilo nel browser: è il prototipo
   **funzionante**. Si scrive davvero, il «+» aggiunge blocchi, la foto si trascina. Il
   comportamento della scrittura è quello, non quello che immagini tu.
4. `src/app/globals.css` — i token. Non inventarne di nuovi: se una misura non è lì, è un errore del
   disegno, non un permesso.

**Vincoli del progetto, non negoziabili:**

- Next.js 16 App Router, React 19, TypeScript senza `any` impliciti, Tailwind v4.
- Le scale native di Tailwind sono azzerate: esistono solo i valori del design system.
  `--spacing: 1px`, quindi `py-16` sono 16 pixel.
- Raggio 0 ovunque tranne `rounded-pill`. Nessuna ombra. Un solo colore d'azione: l'oro.
- I `tracking` sulle maiuscole non si omettono mai.
- Ogni testo passa dal dizionario `src/i18n/dictionaries/it.ts`, mai stringhe in linea. L'area
  riservata è solo italiana, ma le chiavi vanno aggiunte anche a `en.ts` per non rompere i tipi.
- Accessibilità: `<label>` veri legati al campo, errori con `role="alert"` e `aria-describedby`,
  focus visibile, tutto raggiungibile da tastiera. Il menu del «+» va navigato con le frecce.
- `npm run typecheck` e `npm run lint` devono passare a ogni sotto-tappa.

**Il punto della tappa:** si smette di modificare il testo con i marcatori e si modificano
direttamente i blocchi `BodyBlock[]`, che sono già la forma in cui il database salva. `EditorToolbar`
e `ArticlePreview` si eliminano; `ArticleBody` non si tocca, e la colonna di scrittura ne replica i
corpi in `scale="article"`, così quello che si scrive è quello che si legge.

**Non reintrodurre una libreria di editor ricco.** È già stata provata su un ramo a parte e
abbandonata, perché il design approvato è l'editor a blocchi e le alternative sono già state
valutate e scartate. L'handover spiega perché.

**Due cose vanno decise con me prima di progettare la struttura**, e il design non le copre:

1. il responsive sotto i 1200px, oltre alla regola del pannello Impostazioni;
2. se fare davvero la libreria Media, o lasciare solo «Carica».

Chiedimele all'inizio, non a metà lavoro.

**Come procedere.** La tappa è grossa: spezzala tu in sotto-tappe e **fermati dopo ciascuna** perché
io guardi. Un ordine che ha senso, ma decidi tu:

1. il modello a blocchi e la loro resa nella colonna di scrittura;
2. le regole da tastiera (Invio, Maiusc+Invio, Backspace, l'ultimo blocco che non si elimina);
3. il «+» e la barra di formattazione sulla selezione;
4. il pannello Impostazioni, PUBBLICA sempre acceso con l'avviso in oro, la riga di controllo in
   fondo;
5. le foto trascinabili — **questa richiede che le variabili `S3_*` siano su Netlify**, altrimenti si
   sviluppa in locale ma in produzione non funziona.

Per la sotto-tappa 2 conviene reintrodurre Vitest: quelle regole sono logica pura, si rompono in
silenzio e si provano male a mano.

**Attenzione all'ordine delle chiavi** quando ricostruisci un blocco: la colonna `body` salva
`JSON.stringify`, quindi un ordine diverso da quello di `parseBlock` fa riscrivere l'articolo a ogni
apertura anche senza modifiche. `toEqual` non se ne accorge: confronta la stringa serializzata.
L'errore è già stato commesso una volta, l'handover lo racconta.

**Se qualcosa nel README non torna con il codice, fermati e chiedi.** Non inventare una terza strada.

**Un limite pratico:** le pagine dell'area riservata richiedono una sessione, e tu non puoi inserire
password nei form. La verifica a video la faccio io. Restano tue: i codici di risposta, la
validazione delle API, `typecheck`, `lint`, `build` e i test.
