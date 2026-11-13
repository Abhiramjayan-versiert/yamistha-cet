import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  Timestamp,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { backendReady, firebaseConfig, statusId, useEmulator } from '../lib/backend';

const app = backendReady ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

if (useEmulator && auth && db) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export type Status = 'pending' | 'verified' | 'rejected';

export type Registration = {
  code: string;
  createdAt: string;
  teamName: string;
  college: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: { name: string; email?: string; phone?: string }[];
  events: { slug: string; name: string }[];
  accommodation: boolean;
  paymentReference: string;
  message: string;
  status: Status;
  adminNote: string;
};

export type WishRow = { id: string; text: string; approved: boolean; createdAt: string };
export type AdminRow = { email: string };

const iso = (value: unknown) => (value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString());
const store = () => {
  if (!db) throw new Error('not connected');
  return db;
};

export async function isAdmin(email: string): Promise<boolean> {
  try {
    return (await getDoc(doc(store(), 'admins', email.toLowerCase()))).exists();
  } catch {
    return false;
  }
}

export async function loadRegistrations(): Promise<Registration[]> {
  const snap = await getDocs(query(collection(store(), 'registrations'), orderBy('createdAt', 'desc'), limit(3000)));
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      code: d.id,
      createdAt: iso(x.createdAt),
      teamName: String(x.teamName ?? ''),
      college: String(x.college ?? ''),
      leaderName: String(x.leaderName ?? ''),
      leaderEmail: String(x.leaderEmail ?? ''),
      leaderPhone: String(x.leaderPhone ?? ''),
      members: Array.isArray(x.members) ? x.members : [],
      events: Array.isArray(x.events) ? x.events : [],
      accommodation: x.accommodation === true,
      paymentReference: String(x.paymentReference ?? ''),
      message: String(x.message ?? ''),
      status: (['pending', 'verified', 'rejected'].includes(x.status) ? x.status : 'pending') as Status,
      adminNote: String(x.adminNote ?? ''),
    };
  });
}

export const errorCode = (err: unknown) => String((err as { code?: string })?.code ?? 'unknown').replace(/^firestore\//, '');

/*
 * Saves the committee's decision on the registration itself, then
 * updates the small public record the team uses to check its status.
 * The second step is separate so that a problem there can never stop
 * a registration from being verified. Returns false if only the second
 * step failed.
 */
export async function reviewRegistration(row: Registration, patch: { status?: Status; adminNote?: string }): Promise<boolean> {
  const update: Record<string, unknown> = {};
  if (patch.adminNote !== undefined) update.adminNote = patch.adminNote;
  if (patch.status) {
    update.status = patch.status;
    update.reviewedAt = patch.status === 'pending' ? null : serverTimestamp();
  }
  await updateDoc(doc(store(), 'registrations', row.code), update);
  if (!patch.status) return true;
  try {
    await updateDoc(doc(store(), 'registrationStatus', statusId(row.code, row.leaderEmail)), { status: patch.status });
    return true;
  } catch {
    return false;
  }
}

/* Makes sure the sign-in token carries the latest "email confirmed" flag. */
export async function refreshToken(): Promise<void> {
  try {
    await auth?.currentUser?.getIdToken(true);
  } catch {
    /* offline: the existing token is used */
  }
}

export async function deleteRegistration(row: Registration): Promise<void> {
  const batch = writeBatch(store());
  batch.delete(doc(store(), 'registrations', row.code));
  batch.delete(doc(store(), 'registrationStatus', statusId(row.code, row.leaderEmail)));
  await batch.commit();
}

export async function loadWishes(): Promise<WishRow[]> {
  const snap = await getDocs(query(collection(store(), 'wishes'), limit(1000)));
  return snap.docs
    .map((d) => ({ id: d.id, text: String(d.data().text ?? ''), approved: d.data().approved === true, createdAt: iso(d.data().createdAt) }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const setWishApproved = (id: string, approved: boolean) => updateDoc(doc(store(), 'wishes', id), { approved });
export const deleteWish = (id: string) => deleteDoc(doc(store(), 'wishes', id));

export async function loadAdmins(): Promise<AdminRow[]> {
  const snap = await getDocs(collection(store(), 'admins'));
  return snap.docs.map((d) => ({ email: d.id })).sort((a, b) => a.email.localeCompare(b.email));
}

export const addAdmin = (email: string) => setDoc(doc(store(), 'admins', email), { addedAt: serverTimestamp() });
export const removeAdmin = (email: string) => deleteDoc(doc(store(), 'admins', email));

const cell = (value: unknown) => {
  let text = String(value ?? '');
  /* stop spreadsheet apps from treating participant text as a formula */
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export function toCsv(rows: Registration[]): string {
  const head = ['Code', 'Submitted', 'Status', 'Team', 'College', 'Leader', 'Leader email', 'Leader phone', 'Team size', 'Members', 'Events', 'Accommodation', 'Payment reference', 'Message', 'Committee note'];
  const lines = rows.map((r) =>
    [
      r.code,
      new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      r.status,
      r.teamName,
      r.college,
      r.leaderName,
      r.leaderEmail,
      r.leaderPhone,
      r.members.length + 1,
      r.members.map((m) => [m.name, m.email, m.phone].filter(Boolean).join(' / ')).join('; '),
      r.events.map((e) => e.name).join('; '),
      r.accommodation ? 'Yes' : 'No',
      r.paymentReference,
      r.message,
      r.adminNote,
    ]
      .map(cell)
      .join(','),
  );
  return [head.map(cell).join(','), ...lines].join('\r\n');
}

export function download(name: string, text: string, type: string) {
  const href = URL.createObjectURL(new Blob(['﻿', text], { type }));
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 1000);
}
