import { site, venue } from '../data/site';
import { parseIst } from './time';

type CalendarEntry = { title: string; location: string; start: string; end?: string };

const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const fullTitle = (title: string) => `${title} | ${site.name} ${site.year}`;
const place = (location: string) => `${location}, ${venue.institution}`;

function range(entry: CalendarEntry): [number, number] | null {
  const start = parseIst(entry.start);
  if (start === null) return null;
  return [start, parseIst(entry.end) ?? start + 60 * 60 * 1000];
}

export function googleCalendarUrl(entry: CalendarEntry): string | null {
  const r = range(entry);
  if (!r) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: fullTitle(entry.title),
    dates: `${stamp(r[0])}/${stamp(r[1])}`,
    location: place(entry.location),
    details: `${site.descriptor}, ${site.host}. ${site.url}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapeIcs = (text: string) => text.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');

/* Builds an .ics file in the browser and hands it to the visitor. */
export function downloadIcs(entry: CalendarEntry): void {
  const r = range(entry);
  if (!r) return;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//YAMISHTA//Schedule//EN',
    'BEGIN:VEVENT',
    `UID:${stamp(r[0])}-${entry.title.replace(/\W+/g, '-').toLowerCase()}@yamishta`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(r[0])}`,
    `DTEND:${stamp(r[1])}`,
    `SUMMARY:${escapeIcs(fullTitle(entry.title))}`,
    `LOCATION:${escapeIcs(place(entry.location))}`,
    `URL:${site.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `${entry.title.replace(/\W+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
