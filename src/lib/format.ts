const kroner = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

/**
 * Reads an amount the way people type it here: "1495", "1.495", "1495,50".
 * Parsing input is not a price rule — the API still decides what things cost.
 */
export function parseKroner(input: string): number | null {
  let text = input.replace(/\s|kr\.?/gi, '');
  if (text.includes(',')) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  return Number(text);
}

/** An amount as it is typed back into a field: "1495" or "1495,5". */
export const kronerInput = (amount: number) => String(amount).replace('.', ',');
