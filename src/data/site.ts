/*
 * YAMISHTA 2027: single source of truth for all website content.
 *
 * Everything the organising team needs to update lives in this file.
 * Any value that begins with "TBA" or lives in a field marked PLACEHOLDER
 * is not real information. Replace it before launch.
 *
 * Set a URL field to an empty string ('') to keep its button in the
 * "opening soon" state. Nothing on this website submits or stores data.
 */

export const site = {
  name: 'YAMISHTA',
  year: '2027',
  descriptor: 'National Management Fest',
  host: 'College of Engineering Trivandrum',
  hostShort: 'CET',
  /* PLACEHOLDER tagline. Replace with the official line if there is one. */
  tagline: 'Strategy, in full bloom.',
  /* PLACEHOLDER: for example "14 and 15 February 2027". */
  dates: 'Dates to be announced',
  /*
   * PLACEHOLDER: the moment the fest begins, in Indian Standard Time,
   * written as 'YYYY-MM-DDTHH:mm' (for example '2027-02-13T09:30').
   * Leave empty and the countdown shows blank lanterns.
   */
  startsAt: '',
  /* The public address of the website. Used for sharing links and previews. */
  url: 'https://yamishta-2027.vercel.app',
  /*
   * Leave empty to use the built-in registration form. Set a link here
   * only if registration moves to an external form instead.
   */
  registrationUrl: '',
  /* PLACEHOLDER: brochure or rulebook PDF link. */
  brochureUrl: '',
};

/*
 * PLACEHOLDER announcements. Shown in a thin bar above the navigation.
 * Give each one a new id so visitors who dismissed an older notice see it.
 * Leave the list empty to hide the bar.
 */
export type Announcement = { id: string; text: string; href?: string; linkLabel?: string };
export const announcements: Announcement[] = [
  {
    id: 'placeholder-1',
    text: 'Placeholder announcement: deadline extensions and venue changes will appear here.',
    href: '#register',
    linkLabel: 'Registration',
  },
];

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'venue', label: 'Venue' },
  { id: 'sponsors', label: 'Partners' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' },
] as const;

/* Sections that are reachable from the footer and the mobile menu. */
export const moreLinks = [
  { id: 'map', label: 'The Painting' },
  { id: 'results', label: 'Results' },
  { id: 'wishes', label: 'Wish Lanterns' },
  { id: 'faq', label: 'FAQ' },
] as const;

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const about = {
  lead: 'YAMISHTA is the national management fest of the College of Engineering Trivandrum, a gathering for students who like to think, plan, pitch and lead.',
  /* PLACEHOLDER paragraphs. Replace with the official write-up. */
  paragraphs: [
    'This space is reserved for the story of YAMISHTA: what the fest stands for, who it is for and what participants can expect across its days. The organising team can replace this paragraph with the official introduction.',
    'Use this second paragraph for the theme of the 2027 edition, the kinds of competitions on offer and anything first-time visitors should know before they arrive on campus.',
  ],
  /* PLACEHOLDER highlights. Do not publish numbers that are not confirmed. */
  highlights: [
    { label: 'Edition', value: 'TBA' },
    { label: 'Events', value: 'TBA' },
    { label: 'Prize pool', value: 'TBA' },
  ],
};

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export type FestEvent = {
  slug: string;
  /* Artwork crop used on the card. One of the files in public/art. */
  art: string;
  name: string;
  category: string;
  /* Which day of the fest. Used by the filters. */
  day: string;
  /* 'Solo' or 'Team'. Used by the filters. */
  format: string;
  summary: string;
  description: string;
  rules: string[];
  eligibility: string;
  teamSize: string;
  dateTime: string;
  venue: string;
  coordinator: { name: string; contact: string };
  registrationUrl: string;
};

const placeholderEvent = (n: number, art: string): FestEvent => {
  const id = String(n).padStart(2, '0');
  return {
    slug: `event-${id}`,
    art,
    name: `Event Name ${id}`,
    category: 'Category TBA',
    day: 'Day TBA',
    format: 'Format TBA',
    summary: 'A short, one line description of this event goes here.',
    description:
      'Replace this text with the full description of the event: the format, the rounds and what the judges are looking for.',
    rules: [
      'Rule one goes here.',
      'Rule two goes here.',
      'Rule three goes here.',
    ],
    eligibility: 'Eligibility criteria TBA',
    teamSize: 'Team size TBA',
    dateTime: 'Date and time TBA',
    venue: 'Venue TBA',
    coordinator: { name: 'Coordinator name TBA', contact: 'Contact TBA' },
    registrationUrl: '',
  };
};

/* PLACEHOLDER events. Edit each object, or add and remove entries freely. */
export const events: FestEvent[] = [
  placeholderEvent(1, 'card-temple'),
  placeholderEvent(2, 'card-moon'),
  placeholderEvent(3, 'card-ridge'),
  placeholderEvent(4, 'card-peak'),
  placeholderEvent(5, 'card-steps'),
  placeholderEvent(6, 'card-clouds'),
];

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

/*
 * start and end are optional and written in Indian Standard Time as
 * 'YYYY-MM-DDTHH:mm' (for example '2027-02-13T10:00'). Once they are set,
 * each stop gains "Add to calendar" links and the schedule highlights
 * what is happening now and what is next.
 */
export type ScheduleItem = { time: string; event: string; venue: string; start?: string; end?: string };
export type ScheduleDay = { label: string; date: string; items: ScheduleItem[] };

/* PLACEHOLDER schedule. */
export const schedule: ScheduleDay[] = [
  {
    label: 'Day One',
    date: 'Date TBA',
    items: [
      { time: 'Time TBA', event: 'Inauguration', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Event Name 01', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Event Name 02', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Event Name 03', venue: 'Venue TBA' },
    ],
  },
  {
    label: 'Day Two',
    date: 'Date TBA',
    items: [
      { time: 'Time TBA', event: 'Event Name 04', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Event Name 05', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Event Name 06', venue: 'Venue TBA' },
      { time: 'Time TBA', event: 'Valedictory and prize distribution', venue: 'Venue TBA' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

export const registration = {
  /* Set to false to close the form. Visitors then see a closed notice. */
  open: true,
  /* How many members a team may add besides its leader. PLACEHOLDER. */
  maxMembers: 4,
  /* Show the "we need accommodation" option on the form. */
  askAccommodation: true,
  /*
   * PLACEHOLDER payment details shown on the form. Participants pay
   * outside the website and type their transaction reference. While
   * upiId still says TBA the reference is optional.
   */
  payment: {
    amount: 'Fee TBA',
    payee: 'Payee name TBA',
    upiId: 'UPI ID TBA',
    instructions: 'Pay the registration fee to the account above, then enter the transaction reference from your payment app.',
  },
  /* PLACEHOLDER details. */
  points: [
    { label: 'Registration opens', value: 'TBA' },
    { label: 'Registration closes', value: 'TBA' },
    { label: 'Fee', value: 'TBA' },
  ],
  note: 'Your details are stored in the fest database and are seen only by the organising committee.',
};

/* ------------------------------------------------------------------ */
/* Results and leaderboard                                             */
/* ------------------------------------------------------------------ */

export type Podium = { place: 'First' | 'Second' | 'Third'; team: string; college: string };
export type EventResult = { event: string; podium: Podium[] };

/*
 * PLACEHOLDER results. Add one entry per finished event, for example:
 *   { event: 'Event Name 01', podium: [{ place: 'First', team: 'Team', college: 'College' }] }
 * While the list is empty the section explains that results are pending.
 */
export const results: EventResult[] = [];

/* PLACEHOLDER overall standings, for a college-wise championship. Optional. */
export type Standing = { college: string; points: number };
export const standings: Standing[] = [];

/* ------------------------------------------------------------------ */
/* The painting: places and secrets                                    */
/* ------------------------------------------------------------------ */

/* Positions are percentages of the painting (left, top). */
export type Place = { id: string; name: string; note: string; x: number; y: number; target: string };

export const places: Place[] = [
  { id: 'branch', name: 'The Great Branch', note: 'Gallery', x: 30.6, y: 13.7, target: 'gallery' },
  { id: 'clouds', name: 'The Cloud Bank', note: 'Schedule', x: 73.5, y: 25.4, target: 'schedule' },
  { id: 'ridge', name: 'The Violet Ridge', note: 'Results', x: 40.4, y: 38.5, target: 'results' },
  { id: 'peak', name: 'The Teal Peak', note: 'Events', x: 85.8, y: 38.5, target: 'events' },
  { id: 'pavilion', name: 'The Pavilion', note: 'Registration', x: 30.6, y: 65.2, target: 'register' },
  { id: 'valley', name: 'The Valley', note: 'Partners', x: 82, y: 76.2, target: 'sponsors' },
  { id: 'steps', name: 'The Stone Steps', note: 'Venue', x: 42.9, y: 82.4, target: 'venue' },
  { id: 'grove', name: 'The Lower Grove', note: 'Wish Lanterns', x: 68.6, y: 94.8, target: 'wishes' },
];

/* Unmarked details in the painting. Finding all of them reveals the reward. */
export type Secret = { id: string; x: number; y: number; found: string };

export const secrets: Secret[] = [
  { id: 'moon', x: 84.6, y: 10.3, found: 'The moon noticed you.' },
  { id: 'flag', x: 25.1, y: 52.3, found: 'The pavilion flag caught the wind.' },
  { id: 'petals', x: 52.8, y: 21.6, found: 'Two petals, still falling.' },
];

/*
 * PLACEHOLDER reward shown when every secret is found. Note that anything
 * written here can be read in the page source, so do not treat a code
 * placed here as confidential.
 */
export const secretReward = {
  title: 'You found every secret.',
  text: 'Reward text TBA. The organising team can place a teaser or an offer here.',
};

/* ------------------------------------------------------------------ */
/* Frequently asked questions                                          */
/* ------------------------------------------------------------------ */

/* PLACEHOLDER answers. The questions are suggestions and can be changed. */
export const faqs: { q: string; a: string }[] = [
  { q: 'Who can take part?', a: 'Answer TBA. State which students and institutions are eligible.' },
  { q: 'Is there a registration fee?', a: 'Answer TBA. List the fee per event or per team, and how to pay.' },
  { q: 'Is accommodation available?', a: 'Answer TBA. Explain the options, the cost and how to request a place.' },
  { q: 'Will participants receive certificates?', a: 'Answer TBA.' },
  { q: 'Can one person join more than one event?', a: 'Answer TBA. Mention any clashes in the schedule.' },
  { q: 'How do I reach the campus?', a: 'Answer TBA. Add the nearest station, airport and bus routes.' },
];

/* ------------------------------------------------------------------ */
/* Venue                                                               */
/* ------------------------------------------------------------------ */

export const venue = {
  institution: 'College of Engineering Trivandrum',
  locality: 'Sreekaryam, Thiruvananthapuram',
  region: 'Kerala, India',
  /* PLACEHOLDER: hall, block or auditorium names for the fest. */
  halls: 'Halls and rooms for each event will be announced with the schedule.',
  /* PLACEHOLDER: paste a Google Maps "Embed a map" URL to show a live map. */
  mapEmbedUrl: '',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=College+of+Engineering+Trivandrum',
  /* PLACEHOLDER travel notes. */
  travel: [
    { label: 'By rail', value: 'Nearest station details TBA' },
    { label: 'By air', value: 'Nearest airport details TBA' },
    { label: 'By road', value: 'Bus and parking details TBA' },
  ],
};

/* ------------------------------------------------------------------ */
/* Sponsors and partners                                               */
/* ------------------------------------------------------------------ */

export type Partner = { name: string; logo?: string; url?: string };
export type PartnerTier = { tier: string; size: 'title' | 'major' | 'standard'; partners: Partner[] };

/* PLACEHOLDER partners. Add a logo path (in public/) and a url when confirmed. */
export const partnerTiers: PartnerTier[] = [
  { tier: 'Title Sponsor', size: 'title', partners: [{ name: 'Title sponsor' }] },
  {
    tier: 'Associate Sponsors',
    size: 'major',
    partners: [{ name: 'Associate sponsor' }, { name: 'Associate sponsor' }, { name: 'Associate sponsor' }],
  },
  {
    tier: 'Event Partners',
    size: 'standard',
    partners: [{ name: 'Event partner' }, { name: 'Event partner' }, { name: 'Event partner' }, { name: 'Event partner' }],
  },
  {
    tier: 'Media Partners',
    size: 'standard',
    partners: [{ name: 'Media partner' }, { name: 'Media partner' }, { name: 'Media partner' }],
  },
  {
    tier: 'Other Partners',
    size: 'standard',
    partners: [{ name: 'Partner' }, { name: 'Partner' }, { name: 'Partner' }, { name: 'Partner' }],
  },
];

export const sponsorshipContact = {
  /* PLACEHOLDER: sponsorship enquiry link or mailto. */
  url: '',
};

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export type GalleryItem = { src?: string; alt: string; caption: string; shape: 'wide' | 'tall' | 'square' };

/*
 * PLACEHOLDER gallery. Add real photographs to public/gallery and set
 * src (for example '/gallery/inauguration.jpg'). Frames without a src
 * are shown as empty mounts, never as invented photographs.
 */
export const gallery: GalleryItem[] = [
  { alt: 'Photograph to be added', caption: 'Photograph 01', shape: 'wide' },
  { alt: 'Photograph to be added', caption: 'Photograph 02', shape: 'tall' },
  { alt: 'Photograph to be added', caption: 'Photograph 03', shape: 'square' },
  { alt: 'Photograph to be added', caption: 'Photograph 04', shape: 'square' },
  { alt: 'Photograph to be added', caption: 'Photograph 05', shape: 'tall' },
  { alt: 'Photograph to be added', caption: 'Photograph 06', shape: 'wide' },
  { alt: 'Photograph to be added', caption: 'Photograph 07', shape: 'square' },
  { alt: 'Photograph to be added', caption: 'Photograph 08', shape: 'square' },
];

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */

export const contact = {
  /* PLACEHOLDER committee members. */
  committee: [
    { role: 'Role TBA', name: 'Name TBA', phone: '' },
    { role: 'Role TBA', name: 'Name TBA', phone: '' },
    { role: 'Role TBA', name: 'Name TBA', phone: '' },
  ],
  /* PLACEHOLDER: official email address, for example 'hello@example.com'. */
  email: '',
  /* PLACEHOLDER: general enquiries phone number. */
  phone: '',
  /* PLACEHOLDER social links. Leave url empty to show the link as pending. */
  socials: [
    { label: 'Instagram', url: '' },
    { label: 'LinkedIn', url: '' },
    { label: 'Facebook', url: '' },
    { label: 'YouTube', url: '' },
  ],
};

export const isPlaceholder = (value: string) => value === '' || /\bTBA\b/.test(value);
