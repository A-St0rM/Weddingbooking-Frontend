/**
 * Domain terms keep their Danish spelling, per ADR-0001 and CONTEXT.md.
 * File and folder names are ASCII-folded (klargoering, not klargøring)
 * because æøå in paths cause trouble across tooling and platforms.
 */

export interface Booking {
  id: string;
  /** The couple, as one commercial entity. A Kunde outlives its Bookings. */
  kundeId: string;
  kundenavn: string;
  /** Usually the couple; sometimes the parents. */
  betalerKundeId: string;
  betalernavn: string;
  harSærskiltBetaler: boolean;
  bryllupsdato: string | null;
  /** Lives in exactly one place. Every per-guest price will be derived from it. */
  gæsteantal: number | null;
  oprettet: string;
}

export interface OpretBooking {
  /** Either an existing customer… */
  kundeId: string | null;
  /** …or a name to create one from. */
  nytKundenavn: string | null;
  bryllupsdato: string | null;
  gæsteantal: number | null;
}
