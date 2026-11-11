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
  /* PLACEHOLDER: main registration link (Google Form, Townscript, etc). */
  registrationUrl: '',
  /* PLACEHOLDER: brochure or rulebook PDF link. */
  brochureUrl: '',
};

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

export type ScheduleItem = { time: string; event: string; venue: string };
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
  /* PLACEHOLDER details. */
  points: [
    { label: 'Registration opens', value: 'TBA' },
    { label: 'Registration closes', value: 'TBA' },
    { label: 'Fee', value: 'TBA' },
  ],
  note: 'Registration is handled through an external form. This website does not collect or store any participant data.',
};

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
