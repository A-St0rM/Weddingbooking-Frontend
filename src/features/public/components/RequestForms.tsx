import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { Sprig } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
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
    <PublicPage title="Jeres bryllup på Engestofte" intro="Kom ud og se godset, eller sig til, hvis I allerede ved, at det skal være her.">
      <div className="stagger grid gap-4">
        <Choice to="/bestil/fremvisning" number="01" title="Kom og se godset" text="Vælg en ledig tid, så viser vi jer rundt på godset." />
        <Choice to="/bestil/bryllup" number="02" title="Vi ved det allerede" text="Vælg en ledig lørdag. Vi holder datoen til jer, mens vi ser bestillingen igennem." />
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
          <legend className="font-display text-xl font-medium">Tid til fremvisning</legend>
          {times.isPending && <Spinner label="Finder ledige tider" />}
          {times.data?.length === 0 && <p className="text-sm text-ink-muted">Der er ingen ledige tider lige nu. Skriv til os, så finder vi en.</p>}
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {times.data?.map((t) => (
              <label
                key={t.start}
                className={cn(
                  'flex min-h-14 cursor-pointer items-center gap-3 rounded-control px-4 text-sm ring-1 transition-all duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary',
                  start === t.start ? 'bg-primary font-medium text-on-primary ring-primary' : 'bg-surface ring-control hover:ring-primary',
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
          <DatePicker dates={dates.data ?? []} value={eventDate} onChange={setEventDate} />
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
            <legend className="mb-2 font-display text-xl font-medium">{index === 0 ? 'Den ene af jer' : 'Den anden af jer'}</legend>
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
      <Button type="submit" loading={pending} disabled={!valid} className="w-full sm:w-auto">
        Send bestilling <ArrowRight aria-hidden="true" weight="bold" className="size-4" />
      </Button>
    </form>
  );
}

function Done({ receipt }: { receipt: Receipt }) {
  return (
    <PublicPage title="Tak. Vi glæder os til at høre mere." intro="Bestillingen er kommet frem.">
      <Card className="animate-rise">
        <CheckCircle aria-hidden="true" weight="duotone" className="size-12 text-ok" />
        <p className="mt-4 font-display text-2xl leading-snug font-medium text-balance">
          {receipt.viewingAt
            ? <>Vi har holdt {dayFormat.format(new Date(receipt.viewingAt))} kl. {timeFormat.format(new Date(receipt.viewingAt))} til jer.</>
            : <>Vi har holdt {formatLongDate(receipt.eventDate)} til jer.</>}
        </p>
        <p className="mt-3 text-ink-muted">Vi ser bestillingen igennem og skriver til jer, så snart vi har bekræftet den.</p>
        <p className="mt-6 border-t border-line pt-4 text-sm text-ink-muted">Jeres reference: <span className="font-mono text-ink">{receipt.reference}</span></p>
      </Card>
    </PublicPage>
  );
}

function Choice({ to, number, title, text }: { to: string; number: string; title: string; text: string }) {
  return (
    <Link to={to} className="group flex items-center gap-5 rounded-card bg-surface p-6 shadow-card ring-1 ring-line/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-primary/40 sm:p-8">
      <span className="font-display text-4xl font-light text-primary/50 tabular">{number}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-2xl font-medium sm:text-3xl">{title}</span>
        <span className="mt-1 block text-ink-muted">{text}</span>
      </span>
      <ArrowRight aria-hidden="true" className="size-6 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

const monthFormat = new Intl.DateTimeFormat('da-DK', { month: 'long', year: 'numeric' });

/** The free Saturdays as a wall of dates, a month to a row — picked with one tap. */
function DatePicker({ dates, value, onChange }: { dates: string[]; value: string; onChange: (date: string) => void }) {
  const years = [...new Set(dates.map((d) => d.slice(0, 4)))];
  const [year, setYear] = useState(value.slice(0, 4) || years[0]);
  const months = new Map<string, string[]>();
  for (const d of dates.filter((d) => d.startsWith(year ?? ''))) months.set(d.slice(0, 7), [...(months.get(d.slice(0, 7)) ?? []), d]);
  return (
    <fieldset>
      <legend className="font-display text-xl font-medium">Vælg en ledig lørdag</legend>
      <p className="text-sm text-ink-muted">Bryllupper holdes lørdage i maj, juni, august og september.</p>
      {dates.length === 0 && <p className="mt-3 text-sm text-ink-muted">Der er ingen ledige datoer lige nu. Skriv til os, så finder vi en løsning.</p>}
      {years.length > 1 && (
        <div role="group" aria-label="År" className="mt-4 flex gap-2">
          {years.map((y) => (
            <button key={y} type="button" aria-pressed={y === year} onClick={() => setYear(y)}
              className={cn('min-h-10 cursor-pointer rounded-full px-4 font-display text-lg font-medium ring-1 transition-colors tabular', y === year ? 'bg-ink text-canvas ring-ink' : 'bg-surface ring-line hover:ring-control')}>
              {y}
            </button>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {[...months].map(([key, days]) => (
          <div key={key}>
            <p className="eyebrow mb-2 first-letter:uppercase">{monthFormat.format(new Date(`${key}-15T12:00:00`)).replace(/ \d{4}$/, '')}</p>
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <label
                  key={d}
                  className={cn(
                    'grid size-12 cursor-pointer place-items-center rounded-control ring-1 transition-all duration-200 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary',
                    value === d ? 'bg-primary text-on-primary ring-primary' : 'bg-surface ring-control hover:ring-primary',
                  )}
                >
                  <input type="radio" name="date" value={d} checked={value === d} onChange={() => onChange(d)} className="sr-only" />
                  <span aria-hidden="true" className="font-display text-xl font-medium tabular">{Number(d.slice(8))}</span>
                  <span className="sr-only">{formatLongDate(d)}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      {value && <p className="mt-5 text-sm">Valgt: <strong className="font-medium first-letter:uppercase">{formatLongDate(value)}</strong></p>}
    </fieldset>
  );
}

const steps = ['I sender jeres bestilling', 'Vi ser den igennem og skriver til jer', 'Vi mødes og planlægger dagen sammen'];

function PublicPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <header className="relative isolate overflow-hidden bg-estate px-6 pt-10 pb-12 text-on-estate sm:px-10 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:px-14 lg:py-14">
        <Sprig className="absolute -right-16 -bottom-20 -z-10 size-[26rem] text-on-estate/[0.06]" />
        <div aria-hidden="true" className="absolute -top-40 -left-32 -z-10 size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(169_181_163/0.2),transparent_60%)]" />
        <Link to="/bestil" className="inline-flex items-center gap-3">
          <Sprig className="size-8 text-on-estate-muted" />
          <span className="font-display text-xl font-medium">Engestofte Gods</span>
        </Link>
        <div className="mt-10 lg:mt-0">
          <h1 className="text-4xl leading-[1.02] font-medium tracking-tight sm:text-5xl xl:text-6xl">{title}</h1>
          {intro && <p className="mt-4 max-w-md text-lg text-on-estate-muted">{intro}</p>}
        </div>
        <ol className="mt-10 hidden space-y-3 lg:mt-0 lg:block">
          <li className="text-[0.7rem] font-semibold tracking-[0.18em] text-on-estate-muted uppercase">Sådan foregår det</li>
          {steps.map((step, i) => (
            <li key={step} className="flex items-baseline gap-3">
              <span className="font-display text-on-estate-muted tabular">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </header>
      <main className="safe-x mx-auto flex w-full max-w-2xl flex-col justify-center py-10 pb-safe lg:min-h-dvh lg:py-16">{children}</main>
    </div>
  );
}
