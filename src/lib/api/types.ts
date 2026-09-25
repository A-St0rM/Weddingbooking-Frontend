import type { components } from '@/lib/api/schema';

type Schemas = components['schemas'];

export type SalesStage = Schemas['SalesStage'];
export type PaymentTerms = Schemas['PaymentTerms'];
export type Booking = Schemas['BookingResponse'];
export type BookingSummary = Schemas['BookingSummaryResponse'];
export type Customer = Schemas['CustomerResponse'];
export type CustomerDetail = Schemas['CustomerDetailResponse'];
export type CustomerSummary = Schemas['CustomerSummaryResponse'];
export type Contact = Schemas['ContactResponse'];
