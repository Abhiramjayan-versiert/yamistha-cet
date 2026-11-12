# YAMISHTA 2027

Website for YAMISHTA 2027, the National Management Fest of the College of Engineering Trivandrum.

The whole site is built from one painting (`art-source/yamishta-reference.jpg`). The painting is fixed behind the page and a camera travels over it: it rests on the pavilion at the entry screen, rises to the moon when the visitor enters, then descends through the clouds and mountains as they scroll, returning to the pavilion at the footer. Snow, drifting clouds, the swaying branch and falling petals are layered on top.

## Run it

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
npm run preview  # serve the production build
```

Stack: React 19, TypeScript, Vite, plain CSS, Firebase for registration data. No animation or UI libraries.

## Updating content

Everything editable lives in **`src/data/site.ts`**: tagline, dates, events, schedule, registration link, venue, partners, gallery and contacts.

- Values containing `TBA` and fields marked `PLACEHOLDER` are not real information. Replace them before launch. They are shown on the site with a dashed "placeholder" tag so nothing can be mistaken for confirmed detail.
- Leave a URL as `''` and its button shows an "opening soon" notice instead of a dead link.
- `registrationUrl`: leave empty to use the built-in registration form. Set it only to send people to an external form instead.
- `venue.mapEmbedUrl`: paste a Google Maps "Embed a map" URL to replace the map placeholder.
- Gallery: put photographs in `public/gallery/` and set `src` on each item. Frames without a `src` stay as empty mounts.
- Partners: add `logo` (a path in `public/`) and `url` per partner.

## Features and how to switch them on

| Feature | Where to configure it |
| --- | --- |
| Countdown | `site.startsAt` (Indian Standard Time, `YYYY-MM-DDTHH:mm`). Empty shows blank lanterns. |
| Announcement bar | `announcements`. Give each notice a new `id`. An empty list hides the bar. |
| Day and night sky | Automatic from the visitor's clock. Visitors can hold a phase with the Sky control in the footer. |
| Painting map | `places` (position in percent of the painting, and the section each leads to). |
| Hidden details | `secrets` and `secretReward`. Text placed there is readable in the page source, so do not treat a code as confidential. |
| Event search and filters | Built from each event's `category`, `day` and `format`. |
| Shareable event pages | Automatic. Each event is served at `/events/<slug>` with its own title and preview image. Set `site.url` to the final domain so previews resolve. |
| Add to calendar, and the live strip | Add `start` and `end` to schedule items (Indian Standard Time). Both appear only for items that have a `start`. |
| Results and standings | `results` and `standings`. |
| FAQ | `faqs`. |
| Wish lanterns | Works with no setup: lanterns are kept in the visitor's own browser. Once Firebase is connected, wishes are also sent for approval and approved ones are shown to everyone. |
| Sound effects | Chimes and wind follow the music toggle and its volume. |

## Registration and the admin dashboard

Teams register in the Registration section of the site. The committee reviews them at `/admin`.

Both use Firebase (Firestore for data, Firebase Authentication for admin sign-in). Until Firebase is connected the form shows a "not connected" notice and cannot be submitted, so nothing is ever pretended to be saved.

### Connect Firebase (about ten minutes, once)

1. In the [Firebase console](https://console.firebase.google.com) create a project. The free Spark plan is enough.
2. **Build, Firestore Database, Create database.** Choose production mode and a region near your participants (for India, `asia-south1`).
3. Open the **Rules** tab of Firestore, replace everything with the contents of `firestore.rules` from this repository, and publish.
4. **Build, Authentication, Get started**, then enable the **Email/Password** sign-in method.
5. In Authentication, **Settings, Authorised domains**, add the site's domain (for example `yamishta-2027.vercel.app`).
6. **Project settings, Your apps**, add a Web app and copy its `apiKey`, `projectId` and `appId`.
7. Add those as environment variables in the Vercel project (see `.env.example`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. Redeploy. These values are public by design. Access is controlled by the rules from step 3.
8. Make the first admin: in Firestore create a collection named `admins` and add a document whose **Document ID is the admin's email address in lower case** (any field, for example `addedAt`).
9. Open `/admin` on the site, choose "Create an account" with that same email, and confirm the address from the email Firebase sends. More admins can then be added from the dashboard's Admins tab.

### What the committee can do at /admin

- See totals, and how many teams each event has.
- Search and filter registrations, open one to see every member, the payment reference and any message.
- Mark a registration verified or rejected, keep a private note, or delete it.
- Export the current view as a CSV file.
- Approve or remove wish lanterns. A wish is public only after approval.
- Add and remove admins.

### What participants get

On submitting, a team sees a registration code (for example `YM-7K2MPQ`). No email is sent. With the code and the leader's email they can check their status in the same section at any time.

Registration settings (open or closed, team size, payment details shown on the form) are in the `registration` block of `src/data/site.ts`.

### Payment

There is no online checkout. The form shows the payment details from `registration.payment`, the team pays outside the website and types the transaction reference, and an admin verifies it against the bank or UPI statement.

### Testing locally with the Firebase emulators

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-yamishta
```

```bash
VITE_FIREBASE_API_KEY=demo VITE_FIREBASE_PROJECT_ID=demo-yamishta VITE_FIREBASE_EMULATOR=1 npm run dev
```

## Structure

```
src/
  data/site.ts            all content
  components/
    Scene.tsx             the painting, camera, clouds, moon glow, branch, lamplight, sky
    Atmosphere.tsx        snowfall and petals (canvas)
    Gate.tsx              ENTER YAMISHTA opening screen
    Nav.tsx, Announcement.tsx, MusicControl.tsx, SkyControl.tsx, Footer.tsx
    Hero (with Countdown), About, PaintingMap, Events, Schedule, Registration,
    RegistrationForm, Results, Venue, Sponsors, Gallery, Wishes, Faq, Contact
  admin/                  the committee dashboard at /admin (loaded only there)
  hooks/                  audio, sky, reduced motion, scroll reveal, active section
  lib/                    database access, calendar files, sound effects, wishes, time parsing
  styles/                 base (tokens), scene, chrome, sections, features
scripts/
  build-art.py            cuts every image in public/art from the painting
  build-music.py          synthesises the soundtrack
vite.config.ts            also writes one page per event at build time
vercel.json               routes /events/<slug> and /admin to the app
firestore.rules           who may read and write what in the database
```

## Artwork

All images in `public/art` are crops or cut-out layers of the reference painting, produced by `scripts/build-art.py`. No other imagery is used. The colour palette in `src/styles/base.css` was sampled from the painting.

## Music

`public/audio/yamishta-theme.mp3` is an original piece generated by `scripts/build-music.py` (piano, koto style plucked strings, soft pads, chimes and wind, all synthesised). It contains no samples or third party recordings. To use a different track, replace the file and keep the same name. Playback starts only when the visitor presses ENTER YAMISHTA, because browsers block sound before a user gesture.

## Motion and performance

- Snow density adapts to screen size and device power, and thins itself if frames run slow.
- Animations pause when the tab is hidden.
- With "reduce motion" enabled, the camera, clouds and petals are still and the snow is drawn as a single frame.

## Fonts

Shippori Mincho and Zen Kaku Gothic New (SIL Open Font License), self-hosted through Fontsource.
