import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { events as festEvents, site } from '../data/site';
import { Crescent } from '../components/Ornaments';
import {
  addAdmin as addAdminDoc,
  auth,
  deleteRegistration,
  deleteWish,
  download,
  isAdmin,
  loadAdmins,
  loadRegistrations,
  loadWishes,
  removeAdmin as removeAdminDoc,
  refreshToken,
  reviewRegistration,
  errorCode,
  setWishApproved,
  toCsv,
  type AdminRow,
  type Registration,
  type Status,
  type WishRow,
} from './client';
import './admin.css';

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/* ------------------------------------------------------------------ sign in */

function SignIn() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setNote('');
    const address = email.trim().toLowerCase();
    try {
      if (mode === 'in') {
        await signInWithEmailAndPassword(auth, address, password);
      } else if (password.length < 10) {
        setNote('Choose a password of at least 10 characters.');
      } else {
        const created = await createUserWithEmailAndPassword(auth, address, password);
        await sendEmailVerification(created.user);
      }
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code.includes('email-already-in-use')) setNote('An account with that email already exists. Sign in instead.');
      else if (code.includes('weak-password')) setNote('Choose a stronger password.');
      else if (code.includes('too-many-requests')) setNote('Too many attempts. Please wait a few minutes.');
      else if (code.includes('network')) setNote('The sign-in service could not be reached.');
      else setNote(mode === 'in' ? 'That email and password do not match an account.' : 'The account could not be created.');
    }
    setBusy(false);
  };

  return (
    <form className="adm-card adm-signin" onSubmit={submit}>
      <Crescent className="adm-signin__moon" />
      <h1>{site.name} Admin</h1>
      <p>{mode === 'in' ? 'Sign in with your committee account.' : 'Create your account. Access is granted only to verified emails on the admin list.'}</p>
      <label htmlFor="adm-email">Email</label>
      <input id="adm-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <label htmlFor="adm-password">Password</label>
      <input
        id="adm-password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
      />
      <button type="submit" className="btn btn--primary" disabled={busy}>
        {busy ? 'Please wait' : mode === 'in' ? 'Sign in' : 'Create account'}
      </button>
      <p className="adm-note" role="status">
        {note}
      </p>
      <button type="button" className="adm-link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setNote(''); }}>
        {mode === 'in' ? 'First time here? Create an account' : 'Already have an account? Sign in'}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ registrations */

function RegistrationRow({ row, onChange, onDelete }: { row: Registration; onChange: (row: Registration, patch: { status?: Status; adminNote?: string }) => Promise<string>; onDelete: (row: Registration) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(row.adminNote);
  const [busy, setBusy] = useState(false);

  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const act = async (patch: { status?: Status; adminNote?: string }) => {
    setBusy(true);
    setFeedback(null);
    const problem = await onChange(row, patch);
    setFeedback(
      problem
        ? { ok: false, text: problem }
        : { ok: true, text: patch.status ? `Saved. Marked as ${patch.status}.` : 'Note saved.' },
    );
    setBusy(false);
  };

  return (
    <li className={`adm-reg adm-reg--${row.status} ${open ? 'is-open' : ''}`}>
      <button type="button" className="adm-reg__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="adm-reg__code">{row.code}</span>
        <span className="adm-reg__team">
          <strong>{row.teamName}</strong>
          <span>{row.college}</span>
        </span>
        <span className="adm-reg__events">{row.events.map((e) => e.name).join(', ')}</span>
        <span className="adm-reg__size">{row.members.length + 1}</span>
        <span className="adm-reg__time">{when(row.createdAt)}</span>
        <span className={`adm-status adm-status--${row.status}`}>{row.status}</span>
      </button>
      {open ? (
        <div className="adm-reg__body">
          <dl>
            <div>
              <dt>Leader</dt>
              <dd>
                {row.leaderName}
                <br />
                <a href={`mailto:${row.leaderEmail}`}>{row.leaderEmail}</a>
                <br />
                <a href={`tel:${row.leaderPhone}`}>{row.leaderPhone}</a>
              </dd>
            </div>
            <div>
              <dt>Members ({row.members.length})</dt>
              <dd>
                {row.members.length === 0
                  ? 'None'
                  : row.members.map((m, i) => (
                      <span key={i} className="adm-member">
                        {[m.name, m.email, m.phone].filter(Boolean).join(', ')}
                      </span>
                    ))}
              </dd>
            </div>
            <div>
              <dt>Payment reference</dt>
              <dd>{row.paymentReference || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Accommodation</dt>
              <dd>{row.accommodation ? 'Requested' : 'Not requested'}</dd>
            </div>
            {row.message ? (
              <div className="adm-wide">
                <dt>Message</dt>
                <dd>{row.message}</dd>
              </div>
            ) : null}
          </dl>
          <div className="adm-reg__note">
            <label htmlFor={`note-${row.code}`}>Committee note (not shown to the team)</label>
            <textarea id={`note-${row.code}`} value={note} maxLength={500} rows={2} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="adm-reg__actions">
            <button type="button" className="btn btn--primary" disabled={busy || row.status === 'verified'} onClick={() => act({ status: 'verified', adminNote: note })}>
              Verify
            </button>
            <button type="button" className="btn btn--ink" disabled={busy || row.status === 'rejected'} onClick={() => act({ status: 'rejected', adminNote: note })}>
              Reject
            </button>
            <button type="button" className="btn btn--ink" disabled={busy || row.status === 'pending'} onClick={() => act({ status: 'pending', adminNote: note })}>
              Back to pending
            </button>
            <button type="button" className="btn btn--ink" disabled={busy || note === row.adminNote} onClick={() => act({ adminNote: note })}>
              Save note
            </button>
            <button type="button" className="adm-link adm-link--danger" disabled={busy} onClick={() => onDelete(row)}>
              Delete
            </button>
          </div>
          <p className={`adm-feedback ${feedback && !feedback.ok ? 'is-error' : ''}`} role="status">
            {busy ? 'Saving' : (feedback?.text ?? '')}
          </p>
        </div>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ dashboard */

type Tab = 'registrations' | 'wishes' | 'admins';

function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>('registrations');
  const [rows, setRows] = useState<Registration[]>([]);
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [newAdmin, setNewAdmin] = useState('');
  const me = user.email?.toLowerCase() ?? '';

  const load = useCallback(async () => {
    setError('');
    const [r, w, a] = await Promise.allSettled([loadRegistrations(), loadWishes(), loadAdmins()]);
    if (r.status === 'fulfilled') setRows(r.value);
    if (w.status === 'fulfilled') setWishes(w.value);
    if (a.status === 'fulfilled') setAdmins(a.value);
    if ([r, w, a].some((x) => x.status === 'rejected')) setError('Some data could not be loaded. Check your connection and refresh.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  /* Returns an empty string on success, or a message to show beside the buttons. */
  const change = async (row: Registration, patch: { status?: Status; adminNote?: string }): Promise<string> => {
    try {
      const synced = await reviewRegistration(row, patch);
      setRows((list) => list.map((r) => (r.code === row.code ? { ...r, ...patch } : r)));
      return synced ? '' : 'Saved, but the team\'s status lookup could not be updated. The dashboard shows the correct status.';
    } catch (err) {
      const code = errorCode(err);
      if (code === 'permission-denied') {
        await refreshToken();
        try {
          await reviewRegistration(row, patch);
          setRows((list) => list.map((r) => (r.code === row.code ? { ...r, ...patch } : r)));
          return '';
        } catch (again) {
          return `Firebase refused the change (${errorCode(again)}). Sign out, sign in again, and retry.`;
        }
      }
      return `The change could not be saved (${code}). Check your connection and retry.`;
    }
  };

  const remove = async (row: Registration) => {
    if (!window.confirm(`Delete the registration for ${row.teamName} (${row.code})? This cannot be undone.`)) return;
    try {
      await deleteRegistration(row);
      setRows((list) => list.filter((r) => r.code !== row.code));
    } catch {
      setError('That registration could not be deleted.');
    }
  };

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      rows.filter(
        (r) =>
          (status === 'all' || r.status === status) &&
          (eventFilter === 'all' || r.events.some((e) => e.slug === eventFilter)) &&
          (!q || `${r.code} ${r.teamName} ${r.college} ${r.leaderName} ${r.leaderEmail} ${r.leaderPhone} ${r.paymentReference}`.toLowerCase().includes(q)),
      ),
    [rows, status, eventFilter, q],
  );

  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  const people = rows.filter((r) => r.status !== 'rejected').reduce((n, r) => n + r.members.length + 1, 0);
  const perEvent = festEvents.map((e) => ({
    ...e,
    teams: rows.filter((r) => r.status !== 'rejected' && r.events.some((x) => x.slug === e.slug)).length,
  }));
  const busiest = Math.max(1, ...perEvent.map((e) => e.teams));
  const pendingWishes = wishes.filter((w) => !w.approved);

  const moderate = async (w: WishRow, approved: boolean) => {
    try {
      await setWishApproved(w.id, approved);
      setWishes((list) => list.map((x) => (x.id === w.id ? { ...x, approved } : x)));
    } catch {
      setError('That wish could not be updated.');
    }
  };
  const removeWish = async (w: WishRow) => {
    try {
      await deleteWish(w.id);
      setWishes((list) => list.filter((x) => x.id !== w.id));
    } catch {
      setError('That wish could not be removed.');
    }
  };

  const addAdmin = async (e: FormEvent) => {
    e.preventDefault();
    const email = newAdmin.trim().toLowerCase();
    if (!/^[^@/\s]+@[^@/\s]+\.[^@/\s]+$/.test(email)) return setError('Enter a valid email address.');
    if (admins.some((a) => a.email === email)) return setError('That email is already an admin.');
    try {
      await addAdminDoc(email);
      setNewAdmin('');
      setAdmins((list) => [...list, { email }].sort((x, y) => x.email.localeCompare(y.email)));
    } catch {
      setError('That admin could not be added.');
    }
  };
  const removeAdmin = async (a: AdminRow) => {
    if (!window.confirm(`Remove ${a.email} from the admin list?`)) return;
    try {
      await removeAdminDoc(a.email);
      setAdmins((list) => list.filter((x) => x.email !== a.email));
    } catch {
      setError('That admin could not be removed.');
    }
  };

  return (
    <>
      <header className="adm-top">
        <a className="adm-brand" href="/">
          <Crescent className="adm-brand__moon" />
          <span>{site.name}</span>
          <em>Admin</em>
        </a>
        <span className="adm-top__user">{me}</span>
        <button type="button" className="btn btn--ghost" onClick={() => void load()}>
          Refresh
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => auth && void signOut(auth)}>
          Sign out
        </button>
      </header>

      <main className="adm-main">
        {error ? (
          <p className="adm-error" role="alert">
            {error}
          </p>
        ) : null}

        <section className="adm-stats" aria-label="Overview">
          {[
            { label: 'Registrations', value: rows.length },
            { label: 'Awaiting review', value: count('pending') },
            { label: 'Verified', value: count('verified') },
            { label: 'Rejected', value: count('rejected') },
            { label: 'Participants', value: people },
          ].map((s) => (
            <div className="adm-stat" key={s.label}>
              <span>{s.label}</span>
              <strong>{loading ? '·' : s.value}</strong>
            </div>
          ))}
        </section>

        <section className="adm-card adm-events" aria-label="Teams per event">
          <h2>Teams per event</h2>
          <ul>
            {perEvent.map((e) => (
              <li key={e.slug}>
                <span>{e.name}</span>
                <i>
                  <b style={{ width: `${(e.teams / busiest) * 100}%` }} />
                </i>
                <strong>{e.teams}</strong>
              </li>
            ))}
          </ul>
        </section>

        <div className="adm-tabs" role="tablist">
          {(
            [
              ['registrations', `Registrations (${rows.length})`],
              ['wishes', `Wish lanterns (${pendingWishes.length} to review)`],
              ['admins', `Admins (${admins.length})`],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'registrations' ? (
          <section className="adm-card">
            <div className="adm-tools">
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code, team, college, leader, payment reference" aria-label="Search registrations" />
              <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | Status)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} aria-label="Filter by event">
                <option value="all">All events</option>
                {festEvents.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn--ink" disabled={shown.length === 0} onClick={() => download(`yamishta-registrations-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(shown), 'text/csv;charset=utf-8')}>
                Export CSV ({shown.length})
              </button>
            </div>
            <div className="adm-reg adm-reg--legend" aria-hidden="true">
              <div className="adm-reg__head">
                <span>Code</span>
                <span>Team</span>
                <span>Events</span>
                <span>Size</span>
                <span>Submitted</span>
                <span>Status</span>
              </div>
            </div>
            {loading ? (
              <p className="adm-empty">Loading registrations.</p>
            ) : shown.length === 0 ? (
              <p className="adm-empty">{rows.length === 0 ? 'No registrations yet. They will appear here as teams sign up.' : 'No registrations match those filters.'}</p>
            ) : (
              <ul className="adm-list">
                {shown.map((r) => (
                  <RegistrationRow key={r.code} row={r} onChange={change} onDelete={remove} />
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {tab === 'wishes' ? (
          <section className="adm-card">
            <h2>Wish lanterns</h2>
            <p className="adm-muted">A wish appears on the public site only after it is approved here.</p>
            {wishes.length === 0 ? (
              <p className="adm-empty">No wishes have been sent yet.</p>
            ) : (
              <ul className="adm-wishes">
                {[...pendingWishes, ...wishes.filter((w) => w.approved)].map((w) => (
                  <li key={w.id} className={w.approved ? 'is-approved' : ''}>
                    <span className="adm-wishes__text">{w.text}</span>
                    <span className="adm-wishes__time">{when(w.createdAt)}</span>
                    <span className={`adm-status adm-status--${w.approved ? 'verified' : 'pending'}`}>{w.approved ? 'shown' : 'waiting'}</span>
                    <button type="button" className="btn btn--ink" onClick={() => moderate(w, !w.approved)}>
                      {w.approved ? 'Hide' : 'Approve'}
                    </button>
                    <button type="button" className="adm-link adm-link--danger" onClick={() => removeWish(w)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {tab === 'admins' ? (
          <section className="adm-card">
            <h2>Admins</h2>
            <p className="adm-muted">
              Anyone on this list can read every registration. After you add an email, that person creates their own account
              on this page with the same address and confirms it by email.
            </p>
            <ul className="adm-admins">
              {admins.map((a) => (
                <li key={a.email}>
                  <span>{a.email}</span>
                  {a.email === me ? <em>You</em> : (
                    <button type="button" className="adm-link adm-link--danger" onClick={() => removeAdmin(a)}>
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form className="adm-tools" onSubmit={addAdmin}>
              <input type="email" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} placeholder="committee.member@example.com" aria-label="Email of the new admin" />
              <button type="submit" className="btn btn--primary">
                Add admin
              </button>
            </form>
          </section>
        ) : null}
      </main>
    </>
  );
}

/* ------------------------------------------------------------------ shell */

function Verify({ user, onVerified }: { user: User; onVerified: () => void }) {
  const [note, setNote] = useState('');
  const check = async () => {
    await user.reload();
    if (user.emailVerified) {
      await user.getIdToken(true);
      onVerified();
    } else setNote('Not confirmed yet. Open the link in the email, then press this again.');
  };
  const resend = async () => {
    try {
      await sendEmailVerification(user);
      setNote('A new confirmation email is on its way.');
    } catch {
      setNote('Please wait a minute before asking for another email.');
    }
  };
  return (
    <div className="adm-card adm-signin">
      <h1>Confirm your email</h1>
      <p>A confirmation link was sent to {user.email}. Open it, then come back here. Check the spam folder if it is missing.</p>
      <button type="button" className="btn btn--primary" onClick={check}>
        I have confirmed it
      </button>
      <p className="adm-note" role="status">
        {note}
      </p>
      <button type="button" className="adm-link" onClick={resend}>
        Send the email again
      </button>
      <button type="button" className="adm-link" onClick={() => auth && void signOut(auth)}>
        Sign out
      </button>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = `Admin | ${site.name} ${site.year}`;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    if (!auth) {
      setChecked(true);
      return () => robots.remove();
    }
    const stop = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setVerified(Boolean(next?.emailVerified));
      setAllowed(null);
      setChecked(true);
    });
    return () => {
      stop();
      robots.remove();
    };
  }, []);

  const email = user?.email ?? '';
  useEffect(() => {
    if (!email || !verified) return;
    let live = true;
    void refreshToken()
      .then(() => isAdmin(email))
      .then((ok) => {
        if (live) setAllowed(ok);
      });
    return () => {
      live = false;
    };
  }, [email, verified]);

  let body;
  if (!auth) {
    body = (
      <div className="adm-card adm-signin">
        <h1>{site.name} Admin</h1>
        <p>The dashboard is not connected to a database yet. Add the Firebase settings described in the README, then redeploy.</p>
      </div>
    );
  } else if (!checked || (user && verified && allowed === null)) {
    body = <p className="adm-wait">Opening the dashboard.</p>;
  } else if (!user) {
    body = <SignIn />;
  } else if (!verified) {
    body = <Verify user={user} onVerified={() => setVerified(true)} />;
  } else if (!allowed) {
    body = (
      <div className="adm-card adm-signin">
        <h1>No access</h1>
        <p>
          {user.email} is signed in but is not on the admin list. Ask an existing admin to add this email, then refresh this
          page.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => void signOut(auth!)}>
          Sign out
        </button>
      </div>
    );
  } else {
    body = <Dashboard user={user} />;
  }

  return <div className="adm">{body}</div>;
}
