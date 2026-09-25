import type { Tone } from '@/components/ui/Badge';
import type {
  DisplayStatus,
  DocumentStatus,
  InstalmentKind,
  InstalmentState,
  PackageKind,
  PaymentTerms,
  ProductGroup,
  ReadinessCategory,
  ReadinessStatus,
  SalesStage,
} from '@/lib/api/types';

export const stageLabels: Record<SalesStage, string> = {
  Inquiry: 'Forespørgsel',
  Viewing: 'Fremvisning aftalt',
  QuoteSent: 'Tilbud sendt',
  Signed: 'Underskrevet',
  Cancelled: 'Afbestilt',
  Lost: 'Tabt',
};

export const stageTones: Record<SalesStage, Tone> = {
  Inquiry: 'neutral',
  Viewing: 'info',
  QuoteSent: 'info',
  Signed: 'primary',
  Cancelled: 'danger',
  Lost: 'neutral',
};

/** The stages a person picks. "Underskrevet" follows from the signed agreement. */
export const manualStages: SalesStage[] = ['Inquiry', 'Viewing', 'QuoteSent', 'Cancelled', 'Lost'];

export const termsLabels: Record<PaymentTerms, string> = {
  New: 'Nye betingelser',
  Old: 'Gamle betingelser',
};

export const termsDescriptions: Record<PaymentTerms, string> = {
  New: '33 % seks måneder før, resten 30 dage før',
  Old: 'Hele beløbet 30 dage før',
};

export const productGroupLabels: Record<ProductGroup, string> = {
  Reception: 'Reception',
  Ceremony: 'Vielse',
  DinnerAndParty: 'Middag og fest',
  LateNight: 'Natmad',
  Bar: 'Bar',
  Breakfast: 'Morgenmad',
  FridayEvent: 'Fredagsarrangement',
  Other: 'Andet',
};

export const packageKindLabels: Record<PackageKind, string> = {
  Base: 'Grundpakke',
  AddOn: 'Tilkøb',
};

export const statusLabels: Record<DisplayStatus, string> = {
  Inquiry: 'Forespørgsel',
  Viewing: 'Fremvisning aftalt',
  QuoteSent: 'Tilbud sendt',
  Signed: 'Underskrevet',
  DateSecured: 'Dato sikret',
  ReadyForEvent: 'Klar til afholdelse',
  Held: 'Afholdt',
  AwaitingPostEventInvoice: 'Afventer efterfakturering',
  PaymentOverdue: 'Betaling forfalden',
  Cancelled: 'Afbestilt',
  Lost: 'Tabt',
};

export const statusTones: Record<DisplayStatus, Tone> = {
  Inquiry: 'neutral',
  Viewing: 'info',
  QuoteSent: 'info',
  Signed: 'primary',
  DateSecured: 'primary',
  ReadyForEvent: 'ok',
  Held: 'neutral',
  AwaitingPostEventInvoice: 'warn',
  PaymentOverdue: 'danger',
  Cancelled: 'danger',
  Lost: 'neutral',
};

export const instalmentLabels: Record<InstalmentKind, string> = {
  ReservationFee: 'Reservationsgebyr',
  Instalment: '33 %-rate',
  FinalPayment: 'Restbetaling',
};

export const instalmentStateLabels: Record<InstalmentState, string> = {
  NotInvoiced: 'Ikke faktureret',
  Draft: 'Kladde',
  Booked: 'Faktureret',
  Paid: 'Betalt',
  Overdue: 'Forfalden',
};

export const instalmentStateTones: Record<InstalmentState, Tone> = {
  NotInvoiced: 'neutral',
  Draft: 'warn',
  Booked: 'info',
  Paid: 'ok',
  Overdue: 'danger',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  Draft: 'Kladde',
  Sent: 'Sendt',
  Booked: 'Bogført',
  Paid: 'Betalt',
};

export const readinessCategoryLabels: Record<ReadinessCategory, string> = {
  Contact: 'Kontakt',
  TableSetting: 'Opdækning og opstilling',
  Decoration: 'Pynt og blomster',
  Food: 'Mad og allergier',
  PostEventInvoicing: 'Efterfakturering',
};

export const readinessStatusLabels: Record<ReadinessStatus, string> = {
  NotStarted: 'Ikke startet',
  InProgress: 'I gang',
  Done: 'Færdig',
};

export const readinessStatusTones: Record<ReadinessStatus, Tone> = {
  NotStarted: 'neutral',
  InProgress: 'warn',
  Done: 'ok',
};
