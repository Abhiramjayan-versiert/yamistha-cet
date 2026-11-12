/*
 * Connection to the fest's database (Firebase).
 *
 * The public site talks to Firestore through its REST interface, so
 * the Firebase library is only downloaded on the admin dashboard.
 *
 * The configuration values are public by design. What anyone may do is
 * decided by firestore.rules: visitors can submit a registration or a
 * wish and read approved wishes. Everything else needs a signed-in admin.
 */

const env = import.meta.env as Record<string, string | undefined>;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? '',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
  appId: env.VITE_FIREBASE_APP_ID ?? '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID ?? ''}.firebaseapp.com`,
};

/* Set VITE_FIREBASE_EMULATOR=1 to develop against the local Firebase emulators. */
export const useEmulator = env.VITE_FIREBASE_EMULATOR === '1';
export const backendReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const HOST = useEmulator ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
const DATABASE = `projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const endpoint = (suffix: string) => `${HOST}/v1/${DATABASE}${suffix}${suffix.includes('?') ? '&' : '?'}key=${firebaseConfig.apiKey}`;

/* Firestore's REST interface wants every value labelled with its type. */
type Json = string | boolean | null | Json[] | { [key: string]: Json };
type Encoded = Record<string, unknown>;

function encode(value: Json): Encoded {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: encodeFields(value) } };
}

const encodeFields = (obj: { [key: string]: Json }) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, encode(v)]));

/* a new document, stamped with the server's own clock */
const createWrite = (path: string, data: { [key: string]: Json }) => ({
  update: { name: `${DATABASE}/${path}`, fields: encodeFields(data) },
  currentDocument: { exists: false },
  updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
});

async function commit(writes: unknown[]): Promise<Response> {
  return fetch(endpoint(':commit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ writes }),
  });
}

/* ------------------------------------------------------------------ registrations */

export type Member = { name: string; email: string; phone: string };

export type RegistrationInput = {
  teamName: string;
  college: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: Member[];
  events: { slug: string; name: string }[];
  accommodation: boolean;
  paymentReference: string;
  message: string;
};

/* no 0/O or 1/I, so a code read aloud or copied by hand stays unambiguous */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomString(length: number, alphabet: string): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export const newCode = () => `YM-${randomString(6, ALPHABET)}`;
export const statusId = (code: string, email: string) => `${code.trim().toUpperCase()}_${email.trim().toLowerCase()}`;

const TRY_AGAIN = 'The registration could not be saved just now. Please try again in a moment.';

/* Stores a registration and returns its code. Throws with a readable message on failure. */
export async function submitRegistration(input: RegistrationInput): Promise<string> {
  if (!backendReady) throw new Error('Registration is not connected to a database yet.');
  const code = newCode();
  let res: Response;
  try {
    res = await commit([
      createWrite(`registrations/${code}`, { ...input, code, status: 'pending', adminNote: '', reviewedAt: null }),
      createWrite(`registrationStatus/${statusId(code, input.leaderEmail)}`, {
        code,
        teamName: input.teamName,
        status: 'pending',
      }),
    ]);
  } catch {
    throw new Error(TRY_AGAIN);
  }
  if (res.ok) return code;
  if (res.status === 400 || res.status === 403) {
    throw new Error('Some details were not accepted. Please check the form and try again.');
  }
  throw new Error(TRY_AGAIN);
}

export type StatusResult = { teamName: string; status: 'pending' | 'verified' | 'rejected' };

export async function checkRegistration(code: string, email: string): Promise<StatusResult | null> {
  if (!backendReady) throw new Error('Registration is not connected to a database yet.');
  const res = await fetch(endpoint(`/registrationStatus/${encodeURIComponent(statusId(code, email))}`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('The status could not be checked just now. Please try again in a moment.');
  const doc = (await res.json()) as { fields?: Record<string, { stringValue?: string }> };
  const status = doc.fields?.status?.stringValue;
  if (status !== 'pending' && status !== 'verified' && status !== 'rejected') return null;
  return { teamName: doc.fields?.teamName?.stringValue ?? '', status };
}

/* ------------------------------------------------------------------ wishes */

export async function fetchApprovedWishes(): Promise<{ id: string; text: string }[]> {
  const res = await fetch(endpoint(':runQuery'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'wishes' }],
        where: { fieldFilter: { field: { fieldPath: 'approved' }, op: 'EQUAL', value: { booleanValue: true } } },
        limit: 40,
      },
    }),
  });
  if (!res.ok) throw new Error(`wishes ${res.status}`);
  const rows = (await res.json()) as { document?: { name: string; fields?: { text?: { stringValue?: string } } } }[];
  return rows
    .filter((r) => r.document)
    .map((r) => ({ id: r.document!.name.split('/').pop() as string, text: r.document!.fields?.text?.stringValue ?? '' }));
}

export async function sendWish(text: string): Promise<boolean> {
  const id = randomString(20, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
  const res = await commit([createWrite(`wishes/${id}`, { text, approved: false })]);
  return res.ok;
}
