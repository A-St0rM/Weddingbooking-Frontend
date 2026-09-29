import type { Tone } from '@/components/ui/Badge';
import type { PaymentTerms, SalesStage } from '@/lib/api/types';

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

export const productGroupLabels: Record<import('@/lib/api/types').ProductGroup, string> = {
  Reception: 'Reception',
  Ceremony: 'Vielse',
  DinnerAndParty: 'Middag og fest',
  LateNight: 'Natmad',
  Bar: 'Bar',
  Breakfast: 'Morgenmad',
  FridayEvent: 'Fredagsarrangement',
  Other: 'Andet',
};

export const packageKindLabels: Record<import('@/lib/api/types').PackageKind, string> = {
  Base: 'Grundpakke',
  AddOn: 'Tilkøb',
};
