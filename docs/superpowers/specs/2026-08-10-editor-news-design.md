# Area riservata: editor delle news

**Data:** 10 agosto 2026 · **Stato:** approvato

## Perché

L'area riservata esiste ed è completa, ma è stata disegnata per chi la costruisce. La useranno
invece le persone di IME Service: **non tecniche, poche volte l'anno**. Con quel pubblico tre cose
diventano difetti veri.

1. **Sei voci di menù su sette portano a una pagina inesistente.** `AdminSidebar` elenca Dashboard,
   Soggetti, Preventivi, Candidature, Media e Impostazioni: solo News esiste, le altre rispondono
   404. Chi accede la prima volta trova uno strumento che sembra guasto.
2. **Si può perdere quello che si è scritto.** L'avviso di uscita usa `beforeunload`, che scatta solo
   sulla chiusura o il ricaricamento della pagina. Il link «← Torna» è una navigazione interna e non
   lo attiva: con l'autosalvataggio a 30 secondi, chi scrive un paragrafo e torna all'elenco lo perde
   senza nessun avviso.
3. **Il testo si scrive con una sintassi da ricordare:** `##` per i titoli, `>` per le citazioni,
   `--` per l'attribuzione, `-` per gli elenchi, e le immagini con due finestrelle `window.prompt`
   che chiedono un indirizzo.

Direzione visiva scelta: **Filo** — lo stesso linguaggio scuro di oggi, coerente con il sito
pubblico e con i mockup 2i/2j, portato al punto. Nessun cambio di palette, nessun raggio, nessuna
ombra.

## Il principio: il sito pubblico non cambia

Il corpo di un articolo è salvato come `BodyBlock[]` (`src/lib/articles/body.ts`), e la formattazione
inline vive come marcatori dentro il testo del blocco: `**grassetto**`, `*corsivo*`,
`__sottolineato__`, `[testo](url)`. `renderInline` non inietta mai markup — spezza il testo in token
e costruisce nodi React, quindi qualunque cosa scriva il redattore finisce come testo o come uno dei
tre tag consentiti.

**Un editor ricco che salvasse HTML butterebbe via quella garanzia.** Quindi l'editor ricco è
un'interfaccia *sopra* il formato esistente, non un formato nuovo: converte marcatori ↔ formattazione
al caricamento e al salvataggio.

Conseguenze, tutte volute:

- i 12 articoli pubblicati non vengono toccati né migrati;
- `ArticleBody`, `renderInline` e le pagine pubbliche restano identici;
- sostituire un giorno la libreria significa riscrivere solo il convertitore.

## Cosa si fa

### 1. Menù ridotto alle pagine che esistono

`AdminSidebar` mantiene **News** e l'uscita. Le altre sei voci vengono rimosse, non disabilitate: a
chi non è tecnico una voce spenta comunica un guasto quanto una rotta. Torneranno insieme alle
pagine.

### 2. Non perdere il lavoro

- «← Torna» diventa un comando che **salva e poi naviga**, non un link.
- L'autosalvataggio resta a 30 secondi e scatta **anche quando la finestra perde il fuoco**.
- `beforeunload` resta per chiusura e ricaricamento.

Criterio di riuscita: scrivere una frase e uscire in qualunque modo non deve mai perderla.

### 3. Editor ricco al posto dell'area di testo

**TipTap.** La ragione è lo schema dichiarativo: il documento viene vincolato esattamente ai sei tipi
di blocco esistenti — *lead, paragrafo, titolo, citazione, elenco, immagine* — e l'editor diventa
incapace di produrre qualcosa che il modello dati non sappia contenere. Con Lexical lo stesso vincolo
andrebbe scritto e mantenuto a mano.

**Peso:** la libreria si carica solo su `/admin/news/[id]`. Next.js divide il codice per rotta e
l'area riservata è dinamica e non indicizzata, quindi il JavaScript del sito pubblico resta invariato.
Da verificare a fine lavoro confrontando l'output della build.

Servono due funzioni nuove, l'una inversa dell'altra:

- `blocksToDoc(blocks: BodyBlock[]): JSONContent` — apre l'articolo nell'editor;
- `docToBlocks(doc: JSONContent): BodyBlock[]` — lo richiude nel formato salvato.

I marcatori inline vengono convertiti in marche di TipTap all'apertura e riscritti come marcatori al
salvataggio: **quello che finisce nel database è identico a oggi.**

### 4. Immagini nel corpo, trascinabili

`Dropzone` e `/api/upload` esistono e funzionano. Serve un nodo immagine nell'editor che li usi:
trascinare una foto la carica e la inserisce, con la didascalia modificabile in linea. Spariscono i
due `window.prompt`.

**Dipendenza:** su Netlify il disco è di sola lettura, quindi in produzione questa funzione resta
inerte finché non è configurato Cloudflare R2. Si sviluppa e si prova in locale con
`STORAGE_DRIVER=local`.

### 5. Rifinitura «Filo»

- Stato scritto a parole: «Bozza · non visibile sul sito» invece del solo colore.
- Il blocco alla pubblicazione dice **cosa** manca: `publishBlockers()` restituisce già l'elenco, ma
  l'interfaccia mostra una frase generica. Diventa «Per pubblicare mancano: copertina, sommario».
- Etichette, spaziature e messaggi rivisti perché si capiscano senza sapere cos'è uno slug.

## Il contratto dell'API cambia

`articlePayloadSchema` passa da `bodyText: string` a `body: BodyBlock[]`, validato lato server con
`parseBlock`, che esiste già e scarta tutto ciò che non riconosce.

Di conseguenza `textToBlocks` e `blocksToText` restano senza utilizzatori e **vanno rimosse**: sono
il ponte fra testo con marcatori e blocchi, e quel ponte non serve più. Il seed non le usa —
costruisce i blocchi direttamente con `serializeBody`.

## Fuori perimetro

- **Duplicare un articolo.** Utile per i contenuti stagionali, non scelto.
- **Archivio dei media.** Ogni foto si continua a caricare singolarmente.
- **Pagine Preventivi e Candidature.** Da valutare a parte, ma con una gravità che va registrata:
  oggi le richieste di preventivo e le candidature **finiscono nel database e nessuno le vede**. Non
  esiste una pagina per leggerle e, con `MAIL_DRIVER=console`, non parte nessuna notifica. È un
  problema più serio di tutti quelli risolti qui.

## Come si verifica

| Cosa | Come |
| --- | --- |
| Nessuna voce di menù rotta | ogni voce risponde 200 o 307, nessuna 404 |
| Nessuna perdita di lavoro | scrivere e uscire in tre modi diversi, il testo c'è sempre |
| Formato invariato | aprire e risalvare un articolo senza modificarlo lascia `body` identico byte per byte |
| Sito pubblico intatto | `/news` e una pagina articolo rendono come prima |
| Peso invariato | il JavaScript delle rotte pubbliche non cresce |
| Sempre | `npm run typecheck`, `npm run lint`, `npm run build` |
