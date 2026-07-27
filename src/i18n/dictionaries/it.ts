/**
 * Dizionario italiano — lingua di riferimento.
 * Tutti i testi vengono da design/Mockup IME Service.dc.html (schermate 1a, 2a-2j).
 * Nessuna stringa va scritta a mano nei componenti: se serve un testo, sta qui.
 *
 * Le etichette `photo` sono il brief fotografico per il cliente: descrivono
 * la foto che dovrà sostituire il segnaposto.
 */
const it = {
  meta: {
    localeName: 'Italiano',
    switchTo: 'Passa a English',
  },

  nav: {
    about: 'Chi siamo',
    impianti: 'Impianti',
    luminarie: 'Luminarie',
    custom: 'Soggetti personalizzati',
    news: 'News',
    careers: 'Lavora con noi',
    openMenu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    mainNav: 'Navigazione principale',
    luminarieMenu: 'Sottomenu Luminarie',
    seasons: {
      natalizie: 'Natalizie',
      eventi: 'Eventi',
    },
  },

  footer: {
    contacts: 'Contatti',
    pages: 'Pagine',
    privacy: 'Privacy',
    cookie: 'Cookie',
    rights: 'IME SERVICE',
    vat: 'P.IVA',
  },

  common: {
    skipToContent: 'Vai al contenuto',
    home: 'Home',
    loading: 'Caricamento…',
    required: 'obbligatorio',
    optional: 'facoltativo',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    page: 'Pagina',
    remove: 'Rimuovi',
    close: 'Chiudi',
    browse: 'sfoglia',
    cancel: 'Annulla',
    confirm: 'Conferma',
    save: 'Salva',
    of: 'di',
  },

  home: {
    metaTitle: 'IME Service — luminarie artistiche e impianti elettrici a Verona',
    metaDescription:
      'Dal 2014 a Domegliara (VR): luminarie artistiche per città ed eventi con La Fabbrica di Babbo Natale, impianti elettrici civili e industriali.',
    hero: {
      eyebrow: 'DAL 2014 · TRE GENERAZIONI DI LUCE',
      ctaPrimary: 'SCOPRI LE LUMINARIE',
      ctaSecondary: 'RICHIEDI UN PREVENTIVO',
      previous: 'Slide precedente',
      next: 'Slide successiva',
      pause: 'Metti in pausa il carosello',
      play: 'Riprendi il carosello',
      goTo: 'Vai alla slide',
      slides: [
        {
          label: 'NATALE',
          title: 'Accendiamo la meraviglia.',
          subtitle:
            'Luminarie artistiche per città ed eventi, impianti elettrici civili e industriali. Da Domegliara, Verona.',
          photo:
            'FOTO SLIDE 1/4 — corso cittadino con luminarie natalizie accese, notturna (fornita dal cliente)',
        },
        {
          label: 'EVENTI',
          title: 'Ogni evento ha la sua luce.',
          subtitle:
            'Allestimenti luminosi per sagre, fiere, matrimoni e manifestazioni: progetto, noleggio e assistenza.',
          photo:
            'FOTO SLIDE 2/4 — allestimento luminoso per un evento estivo all’aperto, sera',
        },
        {
          label: 'IMPIANTI',
          title: 'Impianti che tengono, negli anni.',
          subtitle:
            'Civili e industriali: progettazione, realizzazione e manutenzione in tutta la provincia.',
          photo: 'FOTO SLIDE 3/4 — quadro elettrico industriale o cantiere in corso',
        },
        {
          label: 'LA FABBRICA',
          title: 'Il tuo soggetto, dal disegno alla luce.',
          subtitle:
            'Decorazioni luminose 2D e 3D costruite su misura nella nostra officina di famiglia.',
          photo:
            'FOTO SLIDE 4/4 — officina della Fabbrica: struttura in filo di alluminio con LED in lavorazione',
        },
      ],
    },
    souls: {
      label: 'DUE ANIME, UNA FAMIGLIA',
      ime: {
        title: 'IME Service',
        eyebrow: 'IMPIANTI & TECNOLOGIA',
        bullets: [
          'Impianti elettrici civili e industriali',
          'Impianti a noleggio per manifestazioni',
          'Giochi di luce e illuminazione architetturale',
        ],
        link: 'ESPLORA GLI IMPIANTI',
      },
      fabbrica: {
        eyebrow: 'DECORAZIONI LUMINOSE',
        bullets: [
          'Decorazioni luminose 2D e 3D',
          'Per aziende private ed enti pubblici',
          'Soggetti personalizzati su disegno',
        ],
        link: 'ENTRA NELLA FABBRICA',
      },
    },
    catalog: {
      title: 'Il catalogo dei soggetti',
      link: 'SFOGLIA TUTTO IL CATALOGO',
    },
    news: {
      title: 'Dalla Fabbrica',
      intro: 'Notizie, progetti e accensioni in giro per il Veneto.',
      link: 'TUTTE LE NEWS',
      empty: 'Le prime notizie stanno per arrivare.',
    },
    cta: {
      title: 'Hai una città, una piazza o un evento da illuminare?',
      subtitle: 'Sopralluogo e proposta grafica senza impegno.',
      button: 'PARLIAMONE',
    },
  },

  luminarie: {
    metaTitle: 'Luminarie artistiche — catalogo soggetti | IME Service',
    metaDescription:
      'Il catalogo completo delle luminarie artistiche IME Service: alberi di Natale, attraversamenti stradali, sospensioni, facciate e soggetti 3D per città ed eventi.',
    breadcrumb: 'HOME / LUMINARIE',
    title: 'Luminarie',
    intro:
      'Il catalogo completo dei soggetti luminosi, dalle installazioni natalizie per le città agli allestimenti per eventi.',
    heroPhoto: 'FOTO — panoramica di una via con più luminarie accese, notturna',
    allTypes: 'Tutte',
    countOne: 'soggetto',
    countMany: 'soggetti',
    filtersLabel: 'Filtra per tipologia',
    seasonsLabel: 'Stagione',
    empty: 'Nessun soggetto corrisponde ai filtri scelti.',
    emptyAction: 'Azzera i filtri',
    cta: {
      title: 'Non trovi il soggetto che immagini?',
      subtitle: 'Lo produciamo su disegno nella nostra Fabbrica.',
      button: 'SOGGETTI PERSONALIZZATI',
    },
  },

  subject: {
    typeLabel: 'TIPOLOGIA',
    specsTitle: 'Scheda tecnica',
    quote: 'RICHIEDI PREVENTIVO',
    addToRequest: '+ ALLA RICHIESTA',
    inRequest: '✓ NELLA RICHIESTA',
    removeFromRequest: 'Togli dalla richiesta',
    note: 'Puoi selezionare più soggetti e inviarci un’unica richiesta con tutto il progetto.',
    installations: 'DOVE L’ABBIAMO INSTALLATO',
    similar: 'Soggetti simili',
    similarLink: 'TUTTI I SOGGETTI',
    galleryLabel: 'Galleria fotografica',
    galleryThumb: 'Mostra la foto',
    requestBadgeOne: 'soggetto nella richiesta',
    requestBadge: 'soggetti nella richiesta',
    specs: {
      heights: 'Altezze disponibili',
      source: 'Sorgente luminosa',
      effects: 'Effetti',
      power: 'Alimentazione',
      formula: 'Formula',
    },
  },

  custom: {
    metaTitle: 'Soggetti luminosi personalizzati su disegno | La Fabbrica di Babbo Natale',
    metaDescription:
      'Decorazioni luminose 2D e 3D su misura: dal tuo disegno o logo alla struttura finita, prodotte nella nostra officina di Domegliara (VR).',
    hero: {
      title: 'Il tuo soggetto, dal disegno alla luce.',
      text: 'Realizziamo decorazioni luminose 2D e 3D su misura: il logo di un’azienda, il simbolo di un paese, un personaggio per un evento. Mandaci uno schizzo, anche a mano.',
      photo:
        'FOTO — soggetto personalizzato in officina: struttura in filo di alluminio con LED, in lavorazione',
      numbers: [
        { value: '4-6', label: 'settimane di produzione' },
        { value: '2D · 3D', label: 'strutture su misura' },
        { value: '2014', label: 'officina di famiglia' },
      ],
    },
    how: {
      label: 'COME FUNZIONA',
      steps: [
        {
          number: '01',
          title: 'Ci racconti l’idea',
          text: 'Compili il form qui sotto e alleghi disegno, foto o logo.',
        },
        {
          number: '02',
          title: 'Proposta grafica',
          text: 'Ti mandiamo il rendering con misure, effetti e preventivo.',
        },
        {
          number: '03',
          title: 'Produzione',
          text: 'Costruiamo la struttura e cabliamo i LED nella nostra officina.',
        },
        {
          number: '04',
          title: 'Consegna o posa',
          text: 'Spediamo o installiamo noi, con collaudo elettrico.',
        },
      ],
    },
    form: {
      title: 'Raccontaci il tuo soggetto',
      subtitle: 'Rispondiamo entro due giorni lavorativi.',
      submit: 'INVIA LA RICHIESTA',
      sending: 'INVIO IN CORSO…',
      successTitle: 'Richiesta inviata.',
      successText:
        'Grazie: abbiamo ricevuto la tua richiesta e ti rispondiamo entro due giorni lavorativi. Se serve prima, chiamaci allo 045 2221396.',
      successAgain: 'Invia un’altra richiesta',
      selectedSubjects: 'Soggetti aggiunti alla richiesta',
      selectedSubjectsHint:
        'Li alleghiamo alla richiesta. Puoi toglierne qualcuno prima di inviare.',
    },
    aside: {
      photo: 'FOTO — esempio di soggetto su misura: stemma comunale luminoso',
      eyebrow: 'PREFERISCI PARLARNE?',
      title: 'Chiamaci, la Fabbrica risponde',
    },
  },

  news: {
    metaTitle: 'News — Dalla Fabbrica | IME Service',
    metaDescription:
      'Accensioni, nuove collezioni, cantieri e piccole storie di luce dal Veneto. Le notizie di IME Service e de La Fabbrica di Babbo Natale.',
    eyebrow: 'NEWS',
    title: 'Dalla Fabbrica',
    intro: 'Accensioni, nuove collezioni, cantieri e piccole storie di luce dal Veneto.',
    allCategories: 'Tutte',
    read: 'LEGGI L’ARTICOLO',
    next: 'AVANTI',
    prev: 'INDIETRO',
    empty: 'Non ci sono ancora articoli in questa categoria.',
    filtersLabel: 'Filtra per categoria',
    paginationLabel: 'Paginazione articoli',
  },

  article: {
    readingTime: 'MIN DI LETTURA',
    keepReading: 'CONTINUA A LEGGERE',
    previous: 'PRECEDENTE',
    next: 'SUCCESSIVO',
    share: 'CONDIVIDI',
    shareFacebook: 'FACEBOOK',
    shareLinkedin: 'LINKEDIN',
    shareLink: 'LINK',
    linkCopied: 'LINK COPIATO',
    tagsLabel: 'Tag dell’articolo',
    notFound: 'Articolo non trovato',
  },

  about: {
    metaTitle: 'Chi siamo — dal 2014, tre generazioni di luce | IME Service',
    metaDescription:
      'IME Service è un’azienda familiare di Domegliara (VR): dal 2014 impianti elettrici civili e industriali, dal 2015 le luminarie artistiche con il marchio La Fabbrica di Babbo Natale.',
    eyebrow: 'DAL 2014 · TRE GENERAZIONI',
    title: 'Chi siamo',
    heroPhoto:
      'FOTO STORICA — archivio di famiglia, officina anni ’70 (o ritratto di gruppo attuale)',
    statement:
      'Siamo una famiglia di elettricisti che a un certo punto ha imparato a fare luce anche per le feste.',
    body1:
      'Tutto comincia in una piccola officina a Domegliara, con impianti civili e industriali. Poi arrivano le luminarie del paese, e da lì i comuni vicini. Oggi uniamo due mestieri: impianti elettrici e decorazioni luminose con il marchio',
    body2:
      'Progettiamo, costruiamo, installiamo e manteniamo. Tutto passa dalla nostra officina: per questo diciamo di sì anche alle richieste più strane.',
    timelineLabel: 'LA NOSTRA STORIA',
    timeline: [
      {
        year: 'Le origini',
        title: 'L’officina di famiglia',
        text: 'L’impiantistica elettrica passa di padre in figlio: case, capannoni e stalle della Valpolicella.',
        accent: 'blue',
      },
      {
        year: '2014',
        title: 'Nasce IME Service',
        text: 'L’attività di famiglia prende la forma di oggi, con officina a Domegliara.',
        accent: 'blue',
      },
      {
        year: '2015',
        title: 'La Fabbrica di Babbo Natale',
        text: 'Nasce il marchio delle decorazioni luminose 2D e 3D, prodotte su disegno in officina.',
        accent: 'red',
      },
      {
        year: 'Oggi',
        title: 'La terza generazione',
        text: 'Impianti, noleggio per manifestazioni e luminarie artistiche per comuni, aziende ed eventi.',
        accent: 'gold',
      },
    ],
    numbers: [
      { value: '2014', label: 'ANNO DI FONDAZIONE' },
      { value: '3', label: 'GENERAZIONI' },
      { value: '80+', label: 'COMUNI ILLUMINATI' },
      { value: '100%', label: 'PRODUZIONE INTERNA' },
    ],
    placesLabel: 'DOVE LAVORIAMO',
    places: [
      {
        title: 'L’officina',
        text: 'Dove nascono le strutture e i cablaggi.',
        photo: 'FOTO — officina: strutture in lavorazione',
      },
      {
        title: 'Il magazzino',
        text: 'Il parco luminarie a noleggio, revisionato ogni anno.',
        photo: 'FOTO — magazzino luminarie stagionali',
      },
      {
        title: 'I mezzi',
        text: 'Piattaforme e furgoni per installare in sicurezza.',
        photo: 'FOTO — mezzi e cestello con livrea IME',
      },
    ],
    cta: {
      title: 'Vieni a trovarci in Via Adige 238',
      subtitle: 'Il modo migliore per capire cosa sappiamo fare è vedere l’officina.',
      button: 'CONTATTACI',
    },
  },

  impianti: {
    metaTitle: 'Impianti elettrici civili e industriali a Verona | IME Service',
    metaDescription:
      'Progettazione, realizzazione e manutenzione di impianti elettrici civili e industriali. Noleggio impianti per sagre, fiere e manifestazioni in provincia di Verona.',
    eyebrow: 'IME SERVICE · IMPIANTI & TECNOLOGIA',
    title: 'Impianti elettrici, dal cantiere alla manifestazione.',
    intro:
      'Progettazione, realizzazione e manutenzione di impianti civili e industriali. E il noleggio completo per fiere, sagre ed eventi.',
    heroPhoto: 'FOTO — quadro elettrico industriale o cantiere in corso',
    ctaPrimary: 'RICHIEDI UN SOPRALLUOGO',
    servicesLabel: 'COSA FACCIAMO',
    services: [
      {
        title: 'Civile e industriale',
        text: 'Impianti nuovi, adeguamenti, quadri, cablaggi, illuminazione interna ed esterna. Certificazioni e collaudi inclusi.',
        photo: 'FOTO — impianto civile, abitazione',
      },
      {
        title: 'Noleggio per eventi',
        text: 'Impianti temporanei per sagre, fiere e manifestazioni: quadri, linee, torri faro, assistenza per tutta la durata.',
        photo: 'FOTO — quadro a noleggio in sagra',
      },
      {
        title: 'Giochi di luce',
        text: 'Illuminazione architetturale e scenografica: facciate, monumenti, vetrine, studi televisivi.',
        photo: 'FOTO — facciata illuminata di sera',
      },
    ],
    processLabel: 'COME LAVORIAMO',
    process: [
      {
        number: '01',
        title: 'Sopralluogo',
        text: 'Veniamo a vedere, misuriamo, ascoltiamo i vincoli.',
      },
      {
        number: '02',
        title: 'Progetto e preventivo',
        text: 'Soluzione tecnica, tempi e costi, senza voci a sorpresa.',
      },
      {
        number: '03',
        title: 'Realizzazione',
        text: 'Squadre interne, materiali di marca, cantiere ordinato.',
      },
      {
        number: '04',
        title: 'Collaudo e manutenzione',
        text: 'Documentazione completa e assistenza negli anni.',
      },
    ],
    sectorsLabel: 'SETTORI',
    sectors: [
      { number: '01', title: 'Abitazioni e condomini', note: 'nuovo · ristrutturazione' },
      { number: '02', title: 'Capannoni e aziende agricole', note: 'quadri · forza motrice' },
      { number: '03', title: 'Negozi, hotel e cantine', note: 'illuminazione · domotica' },
      { number: '04', title: 'Enti pubblici e manifestazioni', note: 'noleggio · sicurezza' },
    ],
    aside: {
      eyebrow: 'CERCHI LE LUMINARIE?',
      title: 'La parte scenografica la cura La Fabbrica',
      text: 'Decorazioni luminose 2D e 3D, soggetti su disegno e allestimenti natalizi per città ed eventi.',
      link: 'VAI ALLE LUMINARIE',
    },
    cta: {
      title: 'Parliamo del tuo impianto',
      subtitle: 'Sopralluogo e preventivo senza impegno, in tutta la provincia di Verona.',
      button: 'RICHIEDI UN SOPRALLUOGO',
    },
  },

  careers: {
    metaTitle: 'Lavora con noi — posizioni aperte | IME Service',
    metaDescription:
      'Cerchiamo elettricisti, cablatori e addetti alle installazioni per la squadra di IME Service a Domegliara (VR). Posizioni aperte e candidatura spontanea.',
    eyebrow: 'LAVORA CON NOI',
    titleLine1: 'Cerchiamo mani',
    titleLine2: 'che sappiano fare luce.',
    heroPhoto: 'FOTO — squadra al lavoro sul cestello, luce del tramonto',
    intro:
      'Un’azienda familiare di Domegliara: piccoli abbastanza perché ci si conosca tutti, strutturati abbastanza per le commesse pubbliche. Si impara sul campo, si sta all’aperto, e a dicembre si fa un mestiere che fanno in pochi al mondo.',
    benefits: [
      'Contratto a tempo indeterminato dopo la prova',
      'Formazione su sicurezza, lavori in quota e certificazioni',
      'Squadre stabili, mezzi e attrezzature aziendali',
      'Cantieri entro 50 km: la sera si torna a casa',
    ],
    positionsLabel: 'POSIZIONI APERTE',
    apply: 'CANDIDATI',
    positions: [
      {
        slug: 'elettricista-installatore',
        title: 'Elettricista installatore',
        text: 'Impianti civili e industriali, cantieri in provincia di Verona. Richiesta esperienza minima di 2 anni e patente B.',
        contract: 'FULL TIME',
        place: 'DOMEGLIARA (VR)',
      },
      {
        slug: 'aiuto-officina-cablatore',
        title: 'Aiuto officina / cablatore',
        text: 'Montaggio strutture e cablaggio LED per le decorazioni della Fabbrica. Anche prima esperienza, con affiancamento.',
        contract: 'FULL TIME',
        place: 'DOMEGLIARA (VR)',
      },
      {
        slug: 'addetto-installazioni-stagionale',
        title: 'Addetto installazioni stagionale',
        text: 'Da settembre a gennaio, per la stagione delle luminarie. Lavoro in quota con piattaforma, formazione fornita da noi.',
        contract: 'STAGIONALE',
        place: 'VERONA E PROVINCIA',
      },
    ],
    form: {
      title: 'Candidatura spontanea',
      subtitle: 'Nessuna posizione ti corrisponde? Scrivici comunque: le squadre crescono ogni anno.',
      photo: 'FOTO — due tecnici in officina mentre cablano un soggetto',
      submit: 'INVIA CANDIDATURA',
      sending: 'INVIO IN CORSO…',
      successTitle: 'Candidatura inviata.',
      successText:
        'Grazie: abbiamo ricevuto il tuo curriculum. Se il profilo è in linea ti richiamiamo noi, altrimenti lo teniamo per le prossime stagioni.',
      spontaneous: 'Candidatura spontanea',
    },
  },

  forms: {
    labels: {
      name: 'NOME E COGNOME',
      company: 'AZIENDA O COMUNE',
      email: 'EMAIL',
      phone: 'TELEFONO',
      subjectType: 'TIPO DI SOGGETTO',
      quantity: 'QUANTITÀ',
      dimensions: 'MISURE INDICATIVE',
      usage: 'SERVE PER',
      drawing: 'IL TUO DISEGNO O LOGO',
      notes: 'NOTE',
      role: 'RUOLO DI INTERESSE',
      cv: 'CURRICULUM',
      about: 'DUE RIGHE SU DI TE',
    },
    placeholders: {
      name: 'Mario Rossi',
      company: 'Comune di …',
      email: 'nome@esempio.it',
      phone: '+39',
      quantity: '1',
      dimensions: 'es. 300 × 180 cm',
      notes: 'Colori, effetti di accensione, dove verrà installato…',
      about: 'Cosa sai fare, cosa ti piacerebbe imparare…',
      choose: 'Scegli…',
    },
    dropzone: {
      title: 'Trascina qui il file o',
      titleCv: 'Trascina il PDF o',
      hintAttachment: 'JPG, PNG, PDF, AI, DWG · max 20 MB · anche una foto dello schizzo a mano',
      hintCv: 'PDF o DOC · max 10 MB',
      uploading: 'Caricamento…',
      remove: 'Rimuovi il file',
    },
    privacy: 'Ho letto l’informativa privacy e acconsento al trattamento dei dati.',
    privacyJob: 'Acconsento al trattamento dei dati per la selezione.',
    privacyLink: 'informativa privacy',
    errors: {
      nameRequired: 'Scrivi il tuo nome e cognome.',
      nameShort: 'Il nome sembra troppo corto.',
      emailRequired: 'Serve un indirizzo email per risponderti.',
      emailInvalid: 'Questo indirizzo email non sembra valido.',
      phoneRequired: 'Serve un numero di telefono.',
      phoneInvalid: 'Questo numero di telefono non sembra valido.',
      contactRequired: 'Lasciaci almeno un’email o un telefono per risponderti.',
      privacyRequired: 'Serve il consenso al trattamento dei dati.',
      cvRequired: 'Allega il tuo curriculum.',
      fileTooBig: 'Il file supera il limite consentito.',
      fileType: 'Formato non ammesso.',
      uploadFailed: 'Caricamento non riuscito. Riprova.',
      generic: 'Qualcosa non ha funzionato. Riprova fra poco o chiamaci allo 045 2221396.',
      tooLong: 'Testo troppo lungo.',
    },
    subjectTypes: [
      { value: '2d-parete', label: '2D a parete' },
      { value: '2d-attraversamento', label: '2D per attraversamento stradale' },
      { value: '3d-terra', label: '3D a terra' },
      { value: '3d-sospeso', label: '3D sospeso' },
      { value: 'logo', label: 'Logo o stemma' },
      { value: 'altro', label: 'Altro / da definire' },
    ],
    usages: [
      { value: 'natale-2026', label: 'Natale 2026' },
      { value: 'natale-2027', label: 'Natale 2027' },
      { value: 'evento', label: 'Un evento specifico' },
      { value: 'permanente', label: 'Installazione permanente' },
      { value: 'da-definire', label: 'Ancora da definire' },
    ],
  },

  privacy: {
    metaTitle: 'Informativa privacy | IME Service',
    metaDescription:
      'Informativa sul trattamento dei dati personali raccolti tramite il sito di IME Service srls.',
    title: 'Informativa privacy',
    eyebrow: 'TRATTAMENTO DEI DATI',
    intro:
      'Questa pagina descrive come IME Service srls tratta i dati personali raccolti attraverso i form del sito.',
    placeholder:
      'Il testo definitivo dell’informativa va fornito dal consulente privacy dell’azienda prima della pubblicazione. La struttura della pagina è pronta: basta sostituire questo contenuto.',
    sections: [
      {
        title: 'Titolare del trattamento',
        text: 'IME Service srls, Via Adige 238, 37015 Domegliara (VR), P.IVA 04236040236, info@ime-service.it.',
      },
      {
        title: 'Dati raccolti',
        text: 'I dati che inserisci nei form di richiesta preventivo e di candidatura: nome, azienda, email, telefono, il testo della richiesta e gli allegati che carichi (disegni, logo, curriculum).',
      },
      {
        title: 'Finalità',
        text: 'Rispondere alla tua richiesta, preparare un preventivo o valutare una candidatura. Non usiamo i tuoi dati per invii commerciali senza il tuo consenso esplicito.',
      },
      {
        title: 'Conservazione',
        text: 'I dati restano archiviati per il tempo necessario a gestire la richiesta e, per le candidature, per il periodo indicato nell’informativa completa.',
      },
      {
        title: 'I tuoi diritti',
        text: 'Puoi chiedere in qualsiasi momento accesso, rettifica o cancellazione dei tuoi dati scrivendo a info@ime-service.it.',
      },
    ],
  },

  notFound: {
    metaTitle: 'Pagina non trovata | IME Service',
    eyebrow: 'ERRORE 404',
    title: 'Questa pagina si è spenta.',
    text: 'L’indirizzo che hai seguito non esiste o è cambiato. Da qui puoi tornare alla home o sfogliare il catalogo.',
    home: 'TORNA ALLA HOME',
    catalog: 'VAI AL CATALOGO',
  },

  admin: {
    brandLabel: 'ADMIN',
    nav: {
      dashboard: 'Dashboard',
      news: 'News',
      subjects: 'Catalogo soggetti',
      quotes: 'Richieste preventivo',
      applications: 'Candidature',
      media: 'Media',
      settings: 'Impostazioni',
    },
    signedInAs: 'Accesso come',
    signOut: 'Esci',
    comingSoon: 'In arrivo',
    comingSoonText:
      'Questa sezione dell’area riservata non è ancora attiva: il turno di design copre la gestione delle news.',
    login: {
      title: 'Area riservata',
      subtitle: 'Accedi per gestire le news del sito.',
      email: 'EMAIL',
      password: 'PASSWORD',
      submit: 'ACCEDI',
      submitting: 'ACCESSO IN CORSO…',
      error: 'Email o password non corretti.',
      backToSite: 'Torna al sito',
    },
    news: {
      title: 'News',
      newArticle: '+ NUOVO ARTICOLO',
      search: 'Cerca per titolo…',
      searchLabel: 'Cerca fra gli articoli',
      countArticles: 'articoli',
      countArticle: 'articolo',
      countDrafts: 'bozze',
      countDraft: 'bozza',
      tabs: { all: 'TUTTI', published: 'PUBBLICATI', drafts: 'BOZZE' },
      columns: {
        title: 'TITOLO',
        category: 'CATEGORIA',
        date: 'DATA',
        status: 'STATO',
        actions: 'AZIONI',
      },
      edit: 'Modifica',
      delete: 'Elimina',
      status: { draft: 'BOZZA', published: 'PUBBLICATO' },
      empty: 'Nessun articolo corrisponde alla ricerca.',
      emptyAll: 'Non c’è ancora nessun articolo. Creane uno.',
      deleteTitle: 'Eliminare questo articolo?',
      deleteText: 'L’operazione non si può annullare. L’articolo sparisce dal sito e dall’archivio.',
      deleteConfirm: 'Elimina definitivamente',
      results: 'di',
    },
    editor: {
      back: 'Articoli',
      preview: 'Anteprima',
      saveDraft: 'Salva bozza',
      publish: 'PUBBLICA',
      unpublish: 'RIPORTA IN BOZZA',
      saving: 'Salvataggio…',
      savedNow: 'Salvato adesso',
      savedAgo: 'Salvato {time}',
      unsaved: 'Modifiche non salvate',
      newArticle: 'Nuovo articolo',
      publishBlocked: 'Per pubblicare servono titolo, categoria, copertina e sommario.',
      labels: {
        title: 'TITOLO',
        category: 'CATEGORIA',
        date: 'DATA DI PUBBLICAZIONE',
        featured: 'IN EVIDENZA',
        cover: 'IMMAGINE DI COPERTINA',
        coverAlt: 'DESCRIZIONE DELLA COPERTINA',
        excerpt: 'SOMMARIO',
        body: 'TESTO',
        tags: 'TAG',
        slug: 'SLUG',
      },
      featuredYes: 'Sì',
      featuredNo: 'No',
      coverReplace: 'Sostituisci · trascina o',
      coverAdd: 'Trascina la copertina o',
      addTag: '+ aggiungi tag',
      newTag: 'Nuovo tag',
      toolbar: {
        bold: 'Grassetto',
        italic: 'Corsivo',
        heading: 'Titolo di sezione',
        quote: 'Citazione',
        list: 'Elenco puntato',
        link: 'Link',
        image: 'immagine',
      },
      previewTitle: 'ANTEPRIMA LIVE',
      desktop: 'DESKTOP',
      mobile: 'MOBILE',
      seo: 'SEO',
      seoTitle: 'Titolo pagina',
      seoDescription: 'Descrizione',
      characters: 'caratteri',
      url: 'URL',
      bodyPlaceholder:
        'Scrivi qui l’articolo. Usa la barra qui sopra per titoli, citazioni, elenchi e immagini.',
      linkPrompt: 'Indirizzo del link',
      imagePrompt: 'Indirizzo dell’immagine',
      imageCaptionPrompt: 'Didascalia (facoltativa)',
    },
  },
} as const;

export default it;
