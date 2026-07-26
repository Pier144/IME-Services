import type { Dictionary } from '../types';

/**
 * English dictionary.
 * Covers the whole interface and the copy of the institutional pages.
 * Editorial data (news articles, catalogue subjects) is authored in Italian and
 * falls back to Italian until the client provides the translations.
 */
const en: Dictionary = {
  meta: {
    localeName: 'English',
    switchTo: 'Passa all’italiano',
  },

  nav: {
    about: 'About us',
    impianti: 'Electrical systems',
    luminarie: 'Light displays',
    custom: 'Custom designs',
    news: 'News',
    careers: 'Work with us',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    mainNav: 'Main navigation',
    luminarieMenu: 'Light displays submenu',
    seasons: {
      natalizie: 'Christmas',
      eventi: 'Events',
    },
  },

  footer: {
    contacts: 'Contact',
    pages: 'Pages',
    privacy: 'Privacy',
    cookie: 'Cookies',
    rights: 'IME SERVICE',
    vat: 'VAT no.',
  },

  common: {
    skipToContent: 'Skip to content',
    home: 'Home',
    loading: 'Loading…',
    required: 'required',
    optional: 'optional',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    page: 'Page',
    remove: 'Remove',
    close: 'Close',
    browse: 'browse',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    of: 'of',
  },

  home: {
    metaTitle: 'IME Service — artistic light displays and electrical systems near Verona',
    metaDescription:
      'Since 1968 in Domegliara (Verona, Italy): artistic light displays for towns and events with La Fabbrica di Babbo Natale, plus residential and industrial electrical systems.',
    hero: {
      eyebrow: 'SINCE 1968 · THREE GENERATIONS OF LIGHT',
      ctaPrimary: 'SEE THE LIGHT DISPLAYS',
      ctaSecondary: 'REQUEST A QUOTE',
      previous: 'Previous slide',
      next: 'Next slide',
      pause: 'Pause the carousel',
      play: 'Resume the carousel',
      goTo: 'Go to slide',
      slides: [
        {
          index: '01',
          label: 'CHRISTMAS',
          title: 'We light up the wonder.',
          subtitle:
            'Artistic light displays for towns and events, residential and industrial electrical systems. From Domegliara, Verona.',
          photo:
            'PHOTO SLIDE 1/4 — town high street with Christmas lights switched on, night shot (supplied by the client)',
        },
        {
          index: '02',
          label: 'EVENTS',
          title: 'Every event has its own light.',
          subtitle:
            'Lighting for fairs, festivals, weddings and public events: design, rental and on-site support.',
          photo: 'PHOTO SLIDE 2/4 — outdoor summer event lighting, evening',
        },
        {
          index: '03',
          label: 'SYSTEMS',
          title: 'Systems that last for years.',
          subtitle:
            'Design, installation and maintenance of residential and industrial electrical systems across the province.',
          photo: 'PHOTO SLIDE 3/4 — industrial switchboard or work site in progress',
        },
        {
          index: '04',
          label: 'THE WORKSHOP',
          title: 'Your design, turned into light.',
          subtitle:
            'Bespoke 2D and 3D light decorations, built in our family workshop.',
          photo:
            'PHOTO SLIDE 4/4 — workshop: aluminium wire structure with LEDs being assembled',
        },
      ],
    },
    souls: {
      label: 'TWO SOULS, ONE FAMILY',
      ime: {
        title: 'IME Service',
        eyebrow: 'SYSTEMS & TECHNOLOGY',
        bullets: [
          'Residential and industrial electrical systems',
          'Temporary systems for public events',
          'Light shows and architectural lighting',
        ],
        link: 'EXPLORE THE SYSTEMS',
      },
      fabbrica: {
        eyebrow: 'LIGHT DECORATIONS',
        bullets: [
          '2D and 3D light decorations',
          'For private companies and public bodies',
          'Custom pieces made from your drawing',
        ],
        link: 'ENTER THE WORKSHOP',
      },
    },
    catalog: {
      title: 'The catalogue',
      link: 'BROWSE THE FULL CATALOGUE',
    },
    news: {
      title: 'From the workshop',
      intro: 'News, projects and switch-on nights around the Veneto.',
      link: 'ALL THE NEWS',
      empty: 'The first stories are on their way.',
    },
    cta: {
      title: 'Got a town, a square or an event to light up?',
      subtitle: 'Site visit and design proposal, no strings attached.',
      button: 'LET’S TALK',
    },
  },

  luminarie: {
    metaTitle: 'Artistic light displays — catalogue | IME Service',
    metaDescription:
      'The full IME Service catalogue of artistic light displays: Christmas trees, street crossings, suspended installations, façades and 3D pieces for towns and events.',
    breadcrumb: 'HOME / LIGHT DISPLAYS',
    title: 'Light displays',
    intro:
      'The full catalogue of light pieces, from Christmas installations for towns to lighting for events.',
    heroPhoto: 'PHOTO — wide view of a street with several light displays on, night shot',
    allTypes: 'All',
    countOne: 'piece',
    countMany: 'pieces',
    filtersLabel: 'Filter by type',
    seasonsLabel: 'Season',
    empty: 'No piece matches the selected filters.',
    emptyAction: 'Clear the filters',
    cta: {
      title: 'Can’t find the piece you have in mind?',
      subtitle: 'We build it from your drawing, in our own workshop.',
      button: 'CUSTOM DESIGNS',
    },
  },

  subject: {
    typeLabel: 'TYPE',
    specsTitle: 'Technical sheet',
    quote: 'REQUEST A QUOTE',
    addToRequest: '+ ADD TO REQUEST',
    inRequest: '✓ IN THE REQUEST',
    removeFromRequest: 'Remove from the request',
    note: 'You can pick several pieces and send us a single request covering the whole project.',
    installations: 'WHERE WE INSTALLED IT',
    similar: 'Similar pieces',
    similarLink: 'ALL THE PIECES',
    galleryLabel: 'Photo gallery',
    galleryThumb: 'Show photo',
    requestBadgeOne: 'piece in the request',
    requestBadge: 'pieces in the request',
    specs: {
      heights: 'Available heights',
      source: 'Light source',
      effects: 'Effects',
      power: 'Power supply',
      formula: 'Purchase or rental',
    },
  },

  custom: {
    metaTitle: 'Custom light pieces made from your drawing | La Fabbrica di Babbo Natale',
    metaDescription:
      'Bespoke 2D and 3D light decorations: from your drawing or logo to the finished structure, made in our workshop in Domegliara (Verona, Italy).',
    hero: {
      title: 'Your design, turned into light.',
      text: 'We build bespoke 2D and 3D light decorations: a company logo, the symbol of a town, a character for an event. Send us a sketch — even a hand-drawn one.',
      photo:
        'PHOTO — custom piece in the workshop: aluminium wire structure with LEDs, work in progress',
      numbers: [
        { value: '4-6', label: 'weeks of production' },
        { value: '2D · 3D', label: 'bespoke structures' },
        { value: '1968', label: 'family workshop' },
      ],
    },
    how: {
      label: 'HOW IT WORKS',
      steps: [
        {
          number: '01',
          title: 'You tell us the idea',
          text: 'Fill in the form below and attach a drawing, a photo or a logo.',
        },
        {
          number: '02',
          title: 'Design proposal',
          text: 'We send you a rendering with sizes, effects and a quote.',
        },
        {
          number: '03',
          title: 'Production',
          text: 'We build the structure and wire the LEDs in our workshop.',
        },
        {
          number: '04',
          title: 'Delivery or installation',
          text: 'We ship it or install it ourselves, electrical testing included.',
        },
      ],
    },
    form: {
      title: 'Tell us about your piece',
      subtitle: 'We reply within two working days.',
      submit: 'SEND THE REQUEST',
      sending: 'SENDING…',
      successTitle: 'Request sent.',
      successText:
        'Thank you — we have received your request and will reply within two working days. If you need us sooner, call +39 045 2221396.',
      successAgain: 'Send another request',
      selectedSubjects: 'Pieces added to the request',
      selectedSubjectsHint: 'We attach them to the request. You can remove any before sending.',
    },
    aside: {
      photo: 'PHOTO — example of a bespoke piece: illuminated town coat of arms',
      eyebrow: 'RATHER TALK IT THROUGH?',
      title: 'Call us, the workshop answers',
    },
  },

  news: {
    metaTitle: 'News — from the workshop | IME Service',
    metaDescription:
      'Switch-on nights, new collections, work sites and small stories of light from the Veneto. News from IME Service and La Fabbrica di Babbo Natale.',
    eyebrow: 'NEWS',
    title: 'From the workshop',
    intro: 'Switch-on nights, new collections, work sites and small stories of light from the Veneto.',
    allCategories: 'All',
    read: 'READ THE ARTICLE',
    next: 'NEXT',
    prev: 'PREVIOUS',
    empty: 'There are no articles in this category yet.',
    filtersLabel: 'Filter by category',
    paginationLabel: 'Article pagination',
  },

  article: {
    readingTime: 'MIN READ',
    keepReading: 'KEEP READING',
    previous: 'PREVIOUS',
    next: 'NEXT',
    share: 'SHARE',
    shareFacebook: 'FACEBOOK',
    shareLinkedin: 'LINKEDIN',
    shareLink: 'LINK',
    linkCopied: 'LINK COPIED',
    tagsLabel: 'Article tags',
    notFound: 'Article not found',
  },

  about: {
    metaTitle: 'About us — since 1968, three generations of light | IME Service',
    metaDescription:
      'IME Service is a family business in Domegliara (Verona, Italy): electrical systems since 1968, artistic light displays since the 1990s, the La Fabbrica di Babbo Natale brand since 2015.',
    eyebrow: 'SINCE 1968 · THREE GENERATIONS',
    title: 'About us',
    heroPhoto: 'ARCHIVE PHOTO — family archive, the workshop in the 1970s (or a current group portrait)',
    statement:
      'We are a family of electricians who, at some point, also learned how to make light for the holidays.',
    body1:
      'It all starts in a small workshop in Domegliara, with residential and industrial systems. Then come the first light displays for the village, and from there the neighbouring towns. Today IME Service brings together two trades: electrical work and the production of light decorations under the brand',
    body2:
      'We design, build, install and maintain. Everything goes through our own workshop, and that is what lets us say yes even to the strangest requests.',
    timelineLabel: 'OUR STORY',
    timeline: [
      {
        year: '1968',
        title: 'The first generation',
        text: 'The electrical business opens in Domegliara: houses, warehouses and Valpolicella farm buildings.',
        accent: 'blue',
      },
      {
        year: 'The 1990s',
        title: 'The first light displays',
        text: 'Christmas lighting for the village becomes a job, then a speciality requested across the province.',
        accent: 'blue',
      },
      {
        year: '2015',
        title: 'La Fabbrica di Babbo Natale',
        text: 'The brand dedicated to 2D and 3D light decorations is born, with in-house production from custom drawings.',
        accent: 'red',
      },
      {
        year: 'Today',
        title: 'The third generation',
        text: 'Electrical systems, event rentals and artistic light displays for towns, companies and private events.',
        accent: 'gold',
      },
    ],
    numbers: [
      { value: '55+', label: 'YEARS IN BUSINESS' },
      { value: '3', label: 'GENERATIONS' },
      { value: '80+', label: 'TOWNS LIT UP' },
      { value: '100%', label: 'IN-HOUSE PRODUCTION' },
    ],
    placesLabel: 'WHERE WE WORK',
    places: [
      {
        title: 'The workshop',
        text: 'Where the structures and the wiring are born.',
        photo: 'PHOTO — workshop: structures being built',
      },
      {
        title: 'The warehouse',
        text: 'The rental fleet of light displays, serviced every year.',
        photo: 'PHOTO — seasonal light display warehouse',
      },
      {
        title: 'The vehicles',
        text: 'Platforms and vans to install safely.',
        photo: 'PHOTO — vehicles and cherry picker in IME livery',
      },
    ],
    cta: {
      title: 'Come and see us at Via Adige 238',
      subtitle: 'The best way to understand what we do is to see the workshop.',
      button: 'GET IN TOUCH',
    },
  },

  impianti: {
    metaTitle: 'Residential and industrial electrical systems near Verona | IME Service',
    metaDescription:
      'Design, installation and maintenance of residential and industrial electrical systems. Temporary system rental for fairs, festivals and events in the province of Verona.',
    eyebrow: 'IME SERVICE · SYSTEMS & TECHNOLOGY',
    title: 'Electrical systems, from the work site to the festival.',
    intro:
      'Design, installation and maintenance of residential and industrial systems. And, when it is only needed for a few days, a complete rental package for fairs, festivals and events.',
    heroPhoto: 'PHOTO — industrial switchboard or work site in progress',
    ctaPrimary: 'BOOK A SITE VISIT',
    servicesLabel: 'WHAT WE DO',
    services: [
      {
        title: 'Residential and industrial',
        text: 'New systems, upgrades, switchboards, wiring, indoor and outdoor lighting. Certification and testing included.',
        photo: 'PHOTO — residential system, home',
      },
      {
        title: 'Event rental',
        text: 'Temporary systems for festivals, fairs and public events: switchboards, cabling, light towers, support throughout.',
        photo: 'PHOTO — rented switchboard at a village festival',
      },
      {
        title: 'Light shows',
        text: 'Architectural and scenic lighting: façades, monuments, shop windows, television studios.',
        photo: 'PHOTO — illuminated façade at night',
      },
    ],
    processLabel: 'HOW WE WORK',
    process: [
      {
        number: '01',
        title: 'Site visit',
        text: 'We come and look, take measurements, listen to the constraints.',
      },
      {
        number: '02',
        title: 'Design and quote',
        text: 'Technical solution, timing and costs, with no surprise items.',
      },
      {
        number: '03',
        title: 'Installation',
        text: 'In-house crews, quality materials, a tidy work site.',
      },
      {
        number: '04',
        title: 'Testing and maintenance',
        text: 'Full documentation and support over the years.',
      },
    ],
    sectorsLabel: 'SECTORS',
    sectors: [
      { number: '01', title: 'Homes and apartment blocks', note: 'new build · renovation' },
      { number: '02', title: 'Warehouses and farms', note: 'switchboards · power' },
      { number: '03', title: 'Shops, hotels and wineries', note: 'lighting · home automation' },
      { number: '04', title: 'Public bodies and events', note: 'rental · safety' },
    ],
    aside: {
      eyebrow: 'LOOKING FOR LIGHT DISPLAYS?',
      title: 'The scenic side is handled by La Fabbrica',
      text: '2D and 3D light decorations, bespoke pieces and Christmas installations for towns and events.',
      link: 'GO TO THE LIGHT DISPLAYS',
    },
    cta: {
      title: 'Let’s talk about your system',
      subtitle: 'Site visit and quote with no obligation, across the province of Verona.',
      button: 'BOOK A SITE VISIT',
    },
  },

  careers: {
    metaTitle: 'Work with us — open positions | IME Service',
    metaDescription:
      'We are looking for electricians, wiring technicians and installation crew for the IME Service team in Domegliara (Verona, Italy). Open positions and speculative applications.',
    eyebrow: 'WORK WITH US',
    titleLine1: 'We are looking for hands',
    titleLine2: 'that know how to make light.',
    heroPhoto: 'PHOTO — crew working from the cherry picker, sunset light',
    intro:
      'We are a family business in Domegliara: small enough that everyone knows each other, structured enough to work on public contracts. You learn on the job, you spend a lot of time outdoors, and in December you do a job very few people in the world do.',
    benefits: [
      'Permanent contract after the trial period',
      'Training on safety, work at height and certifications',
      'Stable crews, company vehicles and equipment',
      'Work sites within 50 km: you go home in the evening',
    ],
    positionsLabel: 'OPEN POSITIONS',
    apply: 'APPLY',
    positions: [
      {
        slug: 'elettricista-installatore',
        title: 'Installation electrician',
        text: 'Residential and industrial systems, work sites in the province of Verona. At least 2 years of experience and a driving licence required.',
        contract: 'FULL TIME',
        place: 'DOMEGLIARA (VR)',
      },
      {
        slug: 'aiuto-officina-cablatore',
        title: 'Workshop assistant / wiring technician',
        text: 'Assembling structures and wiring LEDs for the workshop decorations. Entry level welcome, with on-the-job training.',
        contract: 'FULL TIME',
        place: 'DOMEGLIARA (VR)',
      },
      {
        slug: 'addetto-installazioni-stagionale',
        title: 'Seasonal installation crew',
        text: 'From September to January, for the light display season. Work at height from a platform, training provided by us.',
        contract: 'SEASONAL',
        place: 'VERONA AND PROVINCE',
      },
    ],
    form: {
      title: 'Speculative application',
      subtitle: 'None of the positions fits? Write to us anyway: the crews grow every year.',
      photo: 'PHOTO — two technicians wiring a piece in the workshop',
      submit: 'SEND APPLICATION',
      sending: 'SENDING…',
      successTitle: 'Application sent.',
      successText:
        'Thank you — we have received your CV. If the profile fits we will call you, otherwise we keep it on file for the coming seasons.',
      spontaneous: 'Speculative application',
    },
  },

  forms: {
    labels: {
      name: 'FULL NAME',
      company: 'COMPANY OR TOWN COUNCIL',
      email: 'EMAIL',
      phone: 'PHONE',
      subjectType: 'TYPE OF PIECE',
      quantity: 'QUANTITY',
      dimensions: 'APPROXIMATE SIZE',
      usage: 'NEEDED FOR',
      drawing: 'YOUR DRAWING OR LOGO',
      notes: 'NOTES',
      role: 'ROLE OF INTEREST',
      cv: 'CV',
      about: 'A COUPLE OF LINES ABOUT YOU',
    },
    placeholders: {
      name: 'Mario Rossi',
      company: 'Town council of …',
      email: 'name@example.com',
      phone: '+39',
      quantity: '1',
      dimensions: 'e.g. 300 × 180 cm',
      notes: 'Colours, lighting effects, where it will be installed…',
      about: 'What you can do, what you would like to learn…',
      choose: 'Choose…',
    },
    dropzone: {
      title: 'Drag the file here or',
      titleCv: 'Drag the PDF here or',
      hintAttachment: 'JPG, PNG, PDF, AI, DWG · max 20 MB · a photo of a hand sketch is fine too',
      hintCv: 'PDF or DOC · max 10 MB',
      uploading: 'Uploading…',
      remove: 'Remove the file',
    },
    privacy: 'I have read the privacy notice and consent to the processing of my data.',
    privacyJob: 'I consent to the processing of my data for recruitment purposes.',
    privacyLink: 'privacy notice',
    errors: {
      nameRequired: 'Please enter your full name.',
      nameShort: 'That name looks too short.',
      emailRequired: 'We need an email address to reply to you.',
      emailInvalid: 'That email address does not look valid.',
      phoneRequired: 'A phone number is required.',
      phoneInvalid: 'That phone number does not look valid.',
      contactRequired: 'Leave us at least an email or a phone number so we can reply.',
      privacyRequired: 'Consent to data processing is required.',
      cvRequired: 'Please attach your CV.',
      fileTooBig: 'The file is over the allowed limit.',
      fileType: 'File format not allowed.',
      uploadFailed: 'Upload failed. Please try again.',
      generic: 'Something went wrong. Try again shortly or call us on +39 045 2221396.',
      tooLong: 'Text is too long.',
    },
    subjectTypes: [
      { value: '2d-parete', label: '2D wall mounted' },
      { value: '2d-attraversamento', label: '2D street crossing' },
      { value: '3d-terra', label: '3D ground standing' },
      { value: '3d-sospeso', label: '3D suspended' },
      { value: 'logo', label: 'Logo or coat of arms' },
      { value: 'altro', label: 'Other / to be defined' },
    ],
    usages: [
      { value: 'natale-2026', label: 'Christmas 2026' },
      { value: 'natale-2027', label: 'Christmas 2027' },
      { value: 'evento', label: 'A specific event' },
      { value: 'permanente', label: 'Permanent installation' },
      { value: 'da-definire', label: 'Still to be defined' },
    ],
  },

  privacy: {
    metaTitle: 'Privacy notice | IME Service',
    metaDescription:
      'How IME Service srls processes the personal data collected through this website.',
    title: 'Privacy notice',
    eyebrow: 'DATA PROCESSING',
    intro:
      'This page describes how IME Service srls processes the personal data collected through the forms on this website.',
    placeholder:
      'The final wording of the notice must be supplied by the company’s privacy adviser before go-live. The page structure is ready: this content just needs replacing.',
    sections: [
      {
        title: 'Data controller',
        text: 'IME Service srls, Via Adige 238, 37015 Domegliara (VR), Italy, VAT no. 04236040236, info@ime-service.it.',
      },
      {
        title: 'Data collected',
        text: 'What you type into the quote request and application forms: name, company, email, phone, the text of your request and any files you upload (drawings, logos, CV).',
      },
      {
        title: 'Purpose',
        text: 'To answer your request, prepare a quote or assess an application. We do not use your data for marketing without your explicit consent.',
      },
      {
        title: 'Retention',
        text: 'Data is kept for as long as needed to handle the request and, for applications, for the period stated in the full notice.',
      },
      {
        title: 'Your rights',
        text: 'You can ask for access, correction or deletion of your data at any time by writing to info@ime-service.it.',
      },
    ],
  },

  notFound: {
    metaTitle: 'Page not found | IME Service',
    eyebrow: 'ERROR 404',
    title: 'This page has gone dark.',
    text: 'The address you followed does not exist or has changed. From here you can go back home or browse the catalogue.',
    home: 'BACK TO THE HOME PAGE',
    catalog: 'GO TO THE CATALOGUE',
  },

  admin: {
    brandLabel: 'ADMIN',
    nav: {
      dashboard: 'Dashboard',
      news: 'News',
      subjects: 'Catalogue',
      quotes: 'Quote requests',
      applications: 'Applications',
      media: 'Media',
      settings: 'Settings',
    },
    signedInAs: 'Signed in as',
    signOut: 'Sign out',
    comingSoon: 'Coming soon',
    comingSoonText:
      'This part of the back office is not active yet: the design round covers news management.',
    login: {
      title: 'Back office',
      subtitle: 'Sign in to manage the site news.',
      email: 'EMAIL',
      password: 'PASSWORD',
      submit: 'SIGN IN',
      submitting: 'SIGNING IN…',
      error: 'Wrong email or password.',
      backToSite: 'Back to the site',
    },
    news: {
      title: 'News',
      newArticle: '+ NEW ARTICLE',
      search: 'Search by title…',
      searchLabel: 'Search the articles',
      countArticles: 'articles',
      countArticle: 'article',
      countDrafts: 'drafts',
      countDraft: 'draft',
      tabs: { all: 'ALL', published: 'PUBLISHED', drafts: 'DRAFTS' },
      columns: {
        title: 'TITLE',
        category: 'CATEGORY',
        date: 'DATE',
        status: 'STATUS',
        actions: 'ACTIONS',
      },
      edit: 'Edit',
      delete: 'Delete',
      status: { draft: 'DRAFT', published: 'PUBLISHED' },
      empty: 'No article matches the search.',
      emptyAll: 'There are no articles yet. Create one.',
      deleteTitle: 'Delete this article?',
      deleteText: 'This cannot be undone. The article disappears from the site and the archive.',
      deleteConfirm: 'Delete permanently',
      results: 'of',
    },
    editor: {
      back: 'Articles',
      preview: 'Preview',
      saveDraft: 'Save draft',
      publish: 'PUBLISH',
      unpublish: 'BACK TO DRAFT',
      saving: 'Saving…',
      savedNow: 'Saved just now',
      savedAgo: 'Saved {time}',
      unsaved: 'Unsaved changes',
      newArticle: 'New article',
      publishBlocked: 'Publishing needs a title, a category, a cover image and a summary.',
      labels: {
        title: 'TITLE',
        category: 'CATEGORY',
        date: 'PUBLICATION DATE',
        featured: 'FEATURED',
        cover: 'COVER IMAGE',
        coverAlt: 'COVER DESCRIPTION',
        excerpt: 'SUMMARY',
        body: 'BODY',
        tags: 'TAGS',
        slug: 'SLUG',
      },
      featuredYes: 'Yes',
      featuredNo: 'No',
      coverReplace: 'Replace · drag or',
      coverAdd: 'Drag the cover here or',
      addTag: '+ add tag',
      newTag: 'New tag',
      toolbar: {
        bold: 'Bold',
        italic: 'Italic',
        heading: 'Section heading',
        quote: 'Pull quote',
        list: 'Bulleted list',
        link: 'Link',
        image: 'image',
      },
      previewTitle: 'LIVE PREVIEW',
      desktop: 'DESKTOP',
      mobile: 'MOBILE',
      seo: 'SEO',
      seoTitle: 'Page title',
      seoDescription: 'Description',
      characters: 'characters',
      url: 'URL',
      bodyPlaceholder:
        'Write the article here. Use the bar above for headings, quotes, lists and images.',
      linkPrompt: 'Link address',
      imagePrompt: 'Image address',
      imageCaptionPrompt: 'Caption (optional)',
    },
  },
};

export default en;
