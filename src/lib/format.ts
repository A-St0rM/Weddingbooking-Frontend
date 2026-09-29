const kroner = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 });
const longDate = new Intl.DateTimeFormat('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatKroner = (amount: number) => kroner.format(amount);

/** DateOnly values arrive as "YYYY-MM-DD"; parse at noon so no timezone shifts the day. */
const parseDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);

export const formatLongDate = (iso: string) => longDate.format(parseDate(iso));
export const formatShortDate = (iso: string) => shortDate.format(parseDate(iso));
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

export const roleLabels = {
  EventManager: 'Event manager',
  Owner: 'Ejer',
  Bookkeeper: 'Bogholder',
  Chef: 'Kok',
  EventProducer: 'Event producer',
} as const;
