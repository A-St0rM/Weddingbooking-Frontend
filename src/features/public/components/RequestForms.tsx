import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from '@phosphor-icons/react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { errorMessage } from '@/lib/api/errorMessage';
import type { components } from '@/lib/api/schema';
import { formatLongDate } from '@/lib/format';
import { usePublicRequests, useViewingTimes, useWeddingDates, type PublicPerson } from '@/features/public/api/public';

type Receipt = components['schemas']['ReceiptResponse'];

const emptyPerson: PublicPerson = { firstName: '', lastName: '', email: '', phone: '' };
const complete = (p: PublicPerson) => p.firstName.trim() && p.lastName.trim() && p.email.includes('@') && p.phone.trim();
const dayFormat = new Intl.DateTimeFormat('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFormat = new Intl.DateTimeFormat('da-DK', { hour: '2-digit', minute: '2-digit' });

/** Where the website links: the two ways a couple can reach the estate. */
export function RequestStartPage() {
  return (
    <PublicPage title="Bryllup på Engestofte Gods" intro="Kom ud og se godset, eller sig til, hvis I allerede ved, at det skal være her.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/bestil/fremvisning" className="rounded-card border border-line bg-surface p-5 shadow-card hover:border-primary">
          <p className="text-lg font-semibold">Bestil en fremvisning</p>
          <p className="mt-1 text-sm text-ink-muted">Vælg en ledig tid, og få godset vist frem.</p>
        </Link>
        <Link to="/bestil/bryllup" className="rounded-card border border-line bg-surface p-5 shadow-card hover:border-primary">
          <p className="text-lg font-semibold">Book brylluppet</p>
          <p className="mt-1 text-sm text-ink-muted">Vælg en ledig dato for jeres bryllup.</p>
        </Link>
      </div>
    </PublicPage>
  );
}

export function ViewingRequestPage() {
  const times = useViewingTimes();
  const { viewing } = usePublicRequests();
  const [start, setStart] = useState('');
  const [wishedDate, setWishedDate] = useState('');

  if (viewing.data) return <Done receipt={viewing.data} />;
  return (
    <PublicPage title="Bestil en fremvisning" intro="Vælg en tid. Vi bekræfter den, så snart vi har set jeres bestilling.">
      <RequestForm
        pending={viewing.isPending}
        error={viewing.error}
        ready={Boolean(start && wishedDate)}
        onSubmit={(people, guestCount, website) => viewing.mutate({ people, start, wishedDate, guestCount, consent: true, website })}
      >
        <fieldset>
          <legend className="text-sm font-semibold">Tid til fremvisning</legend>
          {times.isPending && <Spinner label="Finder ledige tider" />}
          {times.data?.length === 0 && <p className="text-sm text-ink-muted">Der er ingen ledige tider lige nu. Skriv til os, så finder vi en.</p>}
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {times.data?.map((t) => (
              <label
                key={t.start}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-3 text-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary',
                  start === t.start ? 'border-primary bg-primary-soft font-medium' : 'border-control bg-surface',
                )}
              >
                <input type="radio" name="time" value={t.start} checked={start === t.start} onChange={() => setStart(t.start)} className="sr-only" />
                <span className="first-letter:uppercase">{dayFormat.format(new Date(t.start))} kl. {timeFormat.format(new Date(t.start))}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Hvornår vil I giftes?" type="date" value={wishedDate} onChange={(e) => setWishedDate(e.target.value)} required hint="Omtrent er fint — I kan flytte den bagefter." />
      </RequestForm>
    </PublicPage>
  );
}

export function WeddingRequestPage() {
  const dates = useWeddingDates();
  const { wedding } = usePublicRequests();
  const [eventDate, setEventDate] = useState('');

  if (wedding.data) return <Done receipt={wedding.data} />;
  return (
    <PublicPage title="Book brylluppet" intro="Vælg en ledig lørdag. Datoen holdes til jer, mens vi ser jeres bestilling igennem.">
      <RequestForm
        pending={wedding.isPending}
        error={wedding.error}
        ready={Boolean(eventDate)}
        onSubmit={(people, guestCount, website) => wedding.mutate({ people, eventDate, guestCount, consent: true, website })}
      >
        {dates.isPending ? (
          <Spinner label="Finder ledige datoer" />
        ) : (
          <Select
            label="Dato"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            options={[{ value: '', label: 'Vælg en ledig dato' }, ...(dates.data ?? []).map((d) => ({ value: d, label: formatLongDate(d) }))]}
            hint="Bryllupper holdes lørdage i maj, juni, august og september."
          />
        )}
      </RequestForm>
    </PublicPage>
  );
}

/** The people, the guests and the consent — the same on both forms. */
function RequestForm({ children, ready, pending, error, onSubmit }: {
  children: ReactNode;
  ready: boolean;
  pending: boolean;
  error: unknown;
  onSubmit: (people: PublicPerson[], guestCount: number, website: string) => void;
}) {
  const [people, setPeople] = useState([emptyPerson, emptyPerson]);
  const [guests, setGuests] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const guestCount = Number.parseInt(guests, 10);
  const valid = ready && people.every(complete) && guestCount >= 1 && guestCount <= 350 && consent;
  const set = (index: number, patch: Partial<PublicPerson>) => setPeople(people.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) onSubmit(people.map((p) => ({ ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: p.email.trim(), phone: p.phone.trim() })), guestCount, website);
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Card className="space-y-4">{children}</Card>
      {people.map((person, index) => (
        <Card key={index}>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 font-semibold">{index === 0 ? 'Den ene af jer' : 'Den anden af jer'}</legend>
            <Field label="Fornavn" autoComplete={index === 0 ? 'given-name' : 'off'} value={person.firstName} onChange={(e) => set(index, { firstName: e.target.value })} required />
            <Field label="Efternavn" autoComplete={index === 0 ? 'family-name' : 'off'} value={person.lastName} onChange={(e) => set(index, { lastName: e.target.value })} required />
            <Field label="E-mail" type="email" inputMode="email" autoCapitalize="none" autoComplete={index === 0 ? 'email' : 'off'} value={person.email} onChange={(e) => set(index, { email: e.target.value })} required />
            <Field label="Telefon" type="tel" inputMode="tel" autoComplete={index === 0 ? 'tel' : 'off'} value={person.phone} onChange={(e) => set(index, { phone: e.target.value })} required />
          </fieldset>
        </Card>
      ))}
      <Card className="space-y-4">
        <Field label="Hvor mange gæster regner I med?" type="number" inputMode="numeric" min={1} max={350} value={guests} onChange={(e) => setGuests(e.target.value)} required />
        {/* Hidden from people and screen readers; a bot filling every field fills this one too. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
          <label>Hjemmeside<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        </div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-primary" />
          <span>Engestofte Gods må gemme vores navne, e-mails og telefonnumre for at kunne svare os og planlægge brylluppet.</span>
        </label>
      </Card>
      {Boolean(error) && <Alert tone="danger">{errorMessage(error)}</Alert>}
      <Button type="submit" loading={pending} disabled={!valid} className="w-full sm:w-auto">Send bestilling</Button>
    </form>
  );
}

function Done({ receipt }: { receipt: Receipt }) {
  return (
    <PublicPage title="Tak — vi har fået jeres bestilling">
      <Card>
        <CheckCircle aria-hidden="true" weight="fill" className="size-10 text-ok" />
        <p className="mt-3">
          {receipt.viewingAt
            ? <>Vi har holdt <strong>{dayFormat.format(new Date(receipt.viewingAt))} kl. {timeFormat.format(new Date(receipt.viewingAt))}</strong> til jer.</>
            : <>Vi har holdt <strong>{formatLongDate(receipt.eventDate)}</strong> til jer.</>}{' '}
          Vi ser bestillingen igennem og skriver til jer, så snart vi har bekræftet den.
        </p>
        <p className="mt-3 text-sm text-ink-muted">Jeres reference: <span className="font-mono">{receipt.reference}</span></p>
      </Card>
    </PublicPage>
  );
}

function PublicPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="safe-x mx-auto min-h-dvh max-w-2xl py-8 pb-safe">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Engestofte Gods</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance">{title}</h1>
      {intro && <p className="mt-2 text-ink-muted">{intro}</p>}
      <div className="mt-6">{children}</div>
    </main>
  );
}
