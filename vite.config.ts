import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { events, site } from './src/data/site';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/*
 * Gives every event its own address: dist/events/<slug>/index.html.
 * Each page is the same app with its own title, description and preview
 * image, so a link shared on WhatsApp or Instagram shows the right event.
 */
function eventPages(): Plugin {
  return {
    name: 'yamishta-event-pages',
    apply: 'build',
    closeBundle() {
      const dist = join(process.cwd(), 'dist');
      const html = readFileSync(join(dist, 'index.html'), 'utf8');
      for (const event of events) {
        const title = escapeHtml(`${event.name} | ${site.name} ${site.year}`);
        const description = escapeHtml(`${event.summary} ${site.descriptor}, ${site.host}.`);
        const url = `${site.url}/events/${event.slug}`;
        const image = `${site.url}/art/og-${event.art}.jpg`;
        const page = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
          .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${title}$2`)
          .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
          .replace(/(<meta\s+property="og:image"\s+content=")[\s\S]*?(")/, `$1${image}$2`)
          .replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?(")/, `$1${url}$2`);
        mkdirSync(join(dist, 'events', event.slug), { recursive: true });
        writeFileSync(join(dist, 'events', event.slug, 'index.html'), page);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), eventPages()],
  build: { assetsInlineLimit: 0 },
});
