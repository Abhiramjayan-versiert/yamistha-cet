import { backendReady, fetchApprovedWishes, sendWish } from './backend';

/*
 * Wish lanterns.
 *
 * Without a database a lantern is kept only in the visitor's own
 * browser: nothing is sent anywhere and nobody else can see it.
 *
 * When the fest's database is connected (see lib/backend.ts), a new
 * wish is also sent there as unapproved. It appears for other visitors
 * only after an admin approves it in the dashboard.
 */

export type Wish = { id: string; text: string; mine: boolean };

const KEY = 'yamishta-wishes';
export const MAX_WISH_LENGTH = 80;

export const sharedWishes = backendReady;

export function cleanWish(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_WISH_LENGTH);
}

export function loadMyWishes(): Wish[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((w) => w && typeof w.id === 'string' && typeof w.text === 'string')
      .map((w) => ({ id: w.id, text: cleanWish(w.text), mine: true }));
  } catch {
    return [];
  }
}

export function saveMyWishes(wishes: Wish[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(wishes.map(({ id, text }) => ({ id, text }))));
  } catch {
    /* storage unavailable: the lantern still flies, it just is not remembered */
  }
}

export async function fetchSharedWishes(): Promise<Wish[]> {
  if (!sharedWishes) return [];
  const rows = await fetchApprovedWishes();
  return rows.map((r) => ({ id: `s-${r.id}`, text: cleanWish(r.text), mine: false }));
}

export async function sendSharedWish(text: string): Promise<boolean> {
  if (!sharedWishes) return false;
  return sendWish(text);
}
