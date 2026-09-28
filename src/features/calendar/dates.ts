// Calendar arithmetic for drawing the grid — presentation only. What is free is the API's call.

export const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const fromIso = (day: string) => new Date(`${day}T12:00:00`);

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday of the week the date is in. */
export function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

/** The six weeks a month view shows, Monday first. */
export function monthGrid(month: Date) {
  const first = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1, 12));
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

/** Does an event touch the local day? */
export function onDay(event: { start: string; end: string }, day: Date) {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = addDays(dayStart, 1);
  return new Date(event.start) < dayEnd && new Date(event.end) > dayStart;
}

export const weekdayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
