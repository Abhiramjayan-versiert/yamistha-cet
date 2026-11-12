import { useEffect, useRef, useState, type FormEvent } from 'react';
import { events, isPlaceholder, registration, site } from '../data/site';
import { backendReady, checkRegistration, submitRegistration, type Member, type StatusResult } from '../lib/backend';
import { sfx } from '../lib/sfx';
import { Pending } from './Ornaments';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9]{7,15}$/;
const cleanPhone = (v: string) => v.replace(/[\s()-]/g, '');
const emptyMember = (): Member => ({ name: '', email: '', phone: '' });

type Errors = Record<string, string>;

const STATUS_TEXT: Record<StatusResult['status'], string> = {
  pending: 'Received. The committee has not reviewed it yet.',
  verified: 'Verified. Your place is confirmed.',
  rejected: 'Not accepted. Please contact the committee.',
};

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error ? <p className="field__hint">{hint}</p> : null}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StatusCheck() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  const check = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !EMAIL.test(email.trim())) {
      setResult('Enter your registration code and the team leader email.');
      return;
    }
    setBusy(true);
    setResult('');
    try {
      const found = await checkRegistration(code, email);
      setResult(found ? `${found.teamName}: ${STATUS_TEXT[found.status]}` : 'No registration matches that code and email.');
    } catch (err) {
      setResult((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="regstatus">
      <summary>Already registered? Check your status</summary>
      <form onSubmit={check} noValidate>
        <div className="field">
          <label htmlFor="status-code">Registration code</label>
          <input id="status-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="YM-XXXXXX" autoComplete="off" maxLength={9} />
        </div>
        <div className="field">
          <label htmlFor="status-email">Team leader email</label>
          <input id="status-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <button type="submit" className="btn btn--ink" disabled={busy || !backendReady}>
          {busy ? 'Checking' : 'Check status'}
        </button>
        <p className="regstatus__result" role="status">
          {result}
        </p>
      </form>
    </details>
  );
}

/*
 * The registration panel. One team per submission: team, leader,
 * members, events and payment reference. Data goes to the fest
 * database, where only signed-in admins can read it.
 */
export function RegistrationForm() {
  const [team, setTeam] = useState('');
  const [college, setCollege] = useState('');
  const [leader, setLeader] = useState<Member>(emptyMember);
  const [members, setMembers] = useState<Member[]>([]);
  const [chosen, setChosen] = useState<string[]>([]);
  const [accommodation, setAccommodation] = useState(false);
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState<{ code: string; team: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const paymentPending = isPlaceholder(registration.payment.upiId);

  /* "Register for this event" on an event page preselects it here */
  useEffect(() => {
    const onPick = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (events.some((ev) => ev.slug === slug)) setChosen((c) => (c.includes(slug) ? c : [...c, slug]));
    };
    window.addEventListener('yamishta:register', onPick);
    return () => window.removeEventListener('yamishta:register', onPick);
  }, []);

  useEffect(() => {
    if (!done) return;
    doneRef.current?.scrollIntoView({ block: 'start' });
    doneRef.current?.focus({ preventScroll: true });
  }, [done]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!team.trim()) e.team = 'Enter a team name.';
    if (!college.trim()) e.college = 'Enter your college or institution.';
    if (!leader.name.trim()) e.leaderName = 'Enter the team leader name.';
    if (!EMAIL.test(leader.email.trim())) e.leaderEmail = 'Enter a valid email address.';
    if (!PHONE.test(cleanPhone(leader.phone))) e.leaderPhone = 'Enter a phone number with 7 to 15 digits.';
    members.forEach((m, i) => {
      if (!m.name.trim()) e[`member${i}Name`] = 'Enter a name, or remove this member.';
      if (m.email.trim() && !EMAIL.test(m.email.trim())) e[`member${i}Email`] = 'Enter a valid email address.';
      if (m.phone.trim() && !PHONE.test(cleanPhone(m.phone))) e[`member${i}Phone`] = 'Enter a valid phone number.';
    });
    if (chosen.length === 0) e.events = 'Choose at least one event.';
    if (!paymentPending && !reference.trim()) e.reference = 'Enter the transaction reference from your payment.';
    if (!consent) e.consent = 'Please confirm before submitting.';
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy) return;
    const found = validate();
    setErrors(found);
    setFailure('');
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>('.has-error input, .has-error textarea, .regform__events.has-error input');
        first?.focus();
      });
      return;
    }
    if (trap) return; // filled only by automated form fillers
    setBusy(true);
    try {
      const code = await submitRegistration({
        teamName: team.trim(),
        college: college.trim(),
        leaderName: leader.name.trim(),
        leaderEmail: leader.email.trim().toLowerCase(),
        leaderPhone: cleanPhone(leader.phone),
        members: members.map((m) => ({ name: m.name.trim(), email: m.email.trim().toLowerCase(), phone: cleanPhone(m.phone) })),
        events: events.filter((e) => chosen.includes(e.slug)).map((e) => ({ slug: e.slug, name: e.name })),
        accommodation,
        paymentReference: reference.trim(),
        message: message.trim(),
      });
      setDone({ code, team: team.trim(), email: leader.email.trim().toLowerCase() });
      sfx.chime(5, 0.07);
      window.dispatchEvent(new CustomEvent('yamishta:bloom'));
    } catch (err) {
      setFailure((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setTeam('');
    setCollege('');
    setLeader(emptyMember());
    setMembers([]);
    setChosen([]);
    setAccommodation(false);
    setReference('');
    setMessage('');
    setConsent(false);
    setErrors({});
    setDone(null);
    setCopied(false);
  };

  const setMember = (i: number, patch: Partial<Member>) =>
    setMembers((list) => list.map((m, n) => (n === i ? { ...m, ...patch } : m)));

  const attrs = (key: string, id: string) => ({
    id,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${id}-error` : undefined,
  });

  if (!registration.open) {
    return (
      <div className="paper regform" id="register-form">
        <p className="regform__closed">Registration is closed. For late entries, please contact the organising committee.</p>
        <StatusCheck />
      </div>
    );
  }

  if (done) {
    return (
      <div className="paper regform regform--done" id="register-form" ref={doneRef} tabIndex={-1} role="status">
        <p className="regform__eyebrow">Registration received</p>
        <h3 className="regform__title">{done.team}, your lantern is lit.</h3>
        <p className="regform__codelabel">Your registration code</p>
        <p className="regform__code">{done.code}</p>
        <div className="regform__doneactions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(done.code);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? 'Code copied' : 'Copy code'}
          </button>
          <button type="button" className="btn btn--ink" onClick={reset}>
            Register another team
          </button>
        </div>
        <p className="regform__after">
          Save this code now. No confirmation email is sent, so the code and the leader email ({done.email}) are how you
          check your status later. The committee reviews each registration{paymentPending ? '' : ' and its payment'} before
          confirming it.
        </p>
        <StatusCheck />
      </div>
    );
  }

  return (
    <div className="paper regform" id="register-form">
      <div className="regform__head">
        <p className="regform__eyebrow">Team registration</p>
        <h3 className="regform__title">Register your team for {site.name} {site.year}.</h3>
        <p>One form per team. Choose every event the team will enter.</p>
      </div>

      {!backendReady ? (
        <p className="regform__offline" role="alert">
          Registration is not connected to a database yet, so this form cannot be submitted. <Pending>Setup required</Pending>
        </p>
      ) : null}

      <form ref={formRef} onSubmit={submit} noValidate>
        <fieldset>
          <legend>
            <span>01</span>Team
          </legend>
          <div className="regform__row">
            <Field id="reg-team" label="Team name" error={errors.team}>
              <input {...attrs('team', 'reg-team')} value={team} onChange={(e) => setTeam(e.target.value)} maxLength={80} autoComplete="off" />
            </Field>
            <Field id="reg-college" label="College or institution" error={errors.college}>
              <input {...attrs('college', 'reg-college')} value={college} onChange={(e) => setCollege(e.target.value)} maxLength={140} autoComplete="organization" />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <span>02</span>Team leader
          </legend>
          <div className="regform__row regform__row--three">
            <Field id="reg-leader-name" label="Full name" error={errors.leaderName}>
              <input {...attrs('leaderName', 'reg-leader-name')} value={leader.name} onChange={(e) => setLeader({ ...leader, name: e.target.value })} maxLength={80} autoComplete="name" />
            </Field>
            <Field id="reg-leader-email" label="Email" error={errors.leaderEmail}>
              <input {...attrs('leaderEmail', 'reg-leader-email')} type="email" value={leader.email} onChange={(e) => setLeader({ ...leader, email: e.target.value })} maxLength={200} autoComplete="email" />
            </Field>
            <Field id="reg-leader-phone" label="Phone" error={errors.leaderPhone}>
              <input {...attrs('leaderPhone', 'reg-leader-phone')} type="tel" value={leader.phone} onChange={(e) => setLeader({ ...leader, phone: e.target.value })} maxLength={20} autoComplete="tel" />
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <span>03</span>Other members
          </legend>
          {members.length === 0 ? <p className="regform__muted">Entering alone? Skip this step.</p> : null}
          {members.map((m, i) => (
            <div className="regform__member" key={i}>
              <div className="regform__row regform__row--three">
                <Field id={`reg-m${i}-name`} label={`Member ${i + 2} name`} error={errors[`member${i}Name`]}>
                  <input {...attrs(`member${i}Name`, `reg-m${i}-name`)} value={m.name} onChange={(e) => setMember(i, { name: e.target.value })} maxLength={80} autoComplete="off" />
                </Field>
                <Field id={`reg-m${i}-email`} label="Email (optional)" error={errors[`member${i}Email`]}>
                  <input {...attrs(`member${i}Email`, `reg-m${i}-email`)} type="email" value={m.email} onChange={(e) => setMember(i, { email: e.target.value })} maxLength={200} autoComplete="off" />
                </Field>
                <Field id={`reg-m${i}-phone`} label="Phone (optional)" error={errors[`member${i}Phone`]}>
                  <input {...attrs(`member${i}Phone`, `reg-m${i}-phone`)} type="tel" value={m.phone} onChange={(e) => setMember(i, { phone: e.target.value })} maxLength={20} autoComplete="off" />
                </Field>
              </div>
              <button type="button" className="regform__remove" onClick={() => setMembers((list) => list.filter((_, n) => n !== i))}>
                Remove member {i + 2}
              </button>
            </div>
          ))}
          {members.length < registration.maxMembers ? (
            <button type="button" className="btn btn--ink regform__add" onClick={() => setMembers((list) => [...list, emptyMember()])}>
              Add a member
            </button>
          ) : (
            <p className="regform__muted">A team can have up to {registration.maxMembers + 1} people.</p>
          )}
        </fieldset>

        <fieldset>
          <legend>
            <span>04</span>Events
          </legend>
          <div className={`regform__events ${errors.events ? 'has-error' : ''}`} role="group" aria-label="Events to enter">
            {events.map((e) => {
              const on = chosen.includes(e.slug);
              return (
                <label key={e.slug} className={`eventpick ${on ? 'is-on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setChosen((c) => (on ? c.filter((s) => s !== e.slug) : [...c, e.slug]))}
                  />
                  <span className="eventpick__box" aria-hidden="true" />
                  <span className="eventpick__text">
                    <strong>{e.name}</strong>
                    <span>
                      {e.category}, {e.teamSize}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.events ? (
            <p className="field__error" role="alert">
              {errors.events}
            </p>
          ) : null}
          {registration.askAccommodation ? (
            <label className="regform__check">
              <input type="checkbox" checked={accommodation} onChange={(e) => setAccommodation(e.target.checked)} />
              <span>Our team would like accommodation. The committee will reply with what is available.</span>
            </label>
          ) : null}
        </fieldset>

        <fieldset>
          <legend>
            <span>05</span>Payment
          </legend>
          <dl className="regform__pay">
            <div>
              <dt>Amount</dt>
              <dd>{registration.payment.amount}</dd>
            </div>
            <div>
              <dt>Pay to</dt>
              <dd>{registration.payment.payee}</dd>
            </div>
            <div>
              <dt>UPI ID</dt>
              <dd>{registration.payment.upiId}</dd>
            </div>
          </dl>
          <p className="regform__muted">
            {registration.payment.instructions}{' '}
            {paymentPending ? <Pending>Payment details to be announced</Pending> : null}
          </p>
          <div className="regform__row">
            <Field
              id="reg-reference"
              label={paymentPending ? 'Transaction reference (optional for now)' : 'Transaction reference'}
              error={errors.reference}
              hint="The UPI or bank reference number shown after you pay."
            >
              <input {...attrs('reference', 'reg-reference')} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={80} autoComplete="off" />
            </Field>
            <Field id="reg-message" label="Anything the committee should know (optional)">
              <textarea id="reg-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={2} />
            </Field>
          </div>
        </fieldset>

        {/* left empty by people, filled by automated form fillers */}
        <div className="regform__trap" aria-hidden="true">
          <label htmlFor="reg-website">Website</label>
          <input id="reg-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </div>

        <label className={`regform__check ${errors.consent ? 'has-error' : ''}`}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={errors.consent ? true : undefined} />
          <span>
            The details above are correct, and every member agrees to share them with the {site.name} organising committee for
            running the fest.
          </span>
        </label>
        {errors.consent ? (
          <p className="field__error" role="alert">
            {errors.consent}
          </p>
        ) : null}

        <div className="regform__submit">
          <button type="submit" className="btn btn--primary" disabled={busy || !backendReady}>
            {busy ? 'Submitting' : 'Submit registration'}
          </button>
          <p className="regform__failure" role="alert">
            {failure}
          </p>
        </div>
      </form>

      <StatusCheck />
    </div>
  );
}
