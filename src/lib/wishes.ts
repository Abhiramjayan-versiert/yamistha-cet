/*
 * Wish lanterns.
 *
 * By default a lantern is kept only in the visitor's own browser.
 * Nothing is sent anywhere and nobody else can see it.
 *
 * To share lanterns between visitors, create a Supabase table (the SQL
 * is in the README) and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 * In shared mode a new wish is stored as unapproved and only appears
 * for other visitors after the committee approves it.
 */

export type Wish = { id: string; text: string; mine: boolean };

const KEY = 'yamishta-wishes';
export const MAX_WISH_LENGTH = 80;

const env = import.meta.env as Record<string, string | undefined>;
const SUPABASE_URL = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

export const sharedWishes = Boolean(SUPABASE_URL && SUPABASE_KEY);

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

const headers = () => ({
  apikey: SUPABASE_KEY as string,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
});

export async function fetchSharedWishes(): Promise<Wish[]> {
  if (!sharedWishes) return [];
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wishes?select=id,text&approved=eq.true&order=created_at.desc&limit=40`,
    { headers: headers() },
  );
  if (!res.ok) throw new Error(`wishes ${res.status}`);
  const rows = (await res.json()) as { id: string | number; text: string }[];
  return rows.map((r) => ({ id: `s-${r.id}`, text: cleanWish(String(r.text)), mine: false }));
}

export async function sendSharedWish(text: string): Promise<boolean> {
  if (!sharedWishes) return false;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wishes`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify({ text }),
  });
  return res.ok;
}
