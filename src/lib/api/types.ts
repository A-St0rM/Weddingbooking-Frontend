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
export type ProductGroup = Schemas['ProductGroup'];
export type LinePricing = Schemas['LinePricing'];
export type PackageKind = Schemas['PackageKind'];
export type Package = Schemas['PackageResponse'];
export type PackageLine = Schemas['PackageLineResponse'];
export type LineRequest = Schemas['LineRequest'];
export type BookingLine = Schemas['BookingLineResponse'];
export type Price = Schemas['PriceResponse'];
export type PricingSettings = Schemas['PricingSettingsResponse'];
export type Role = Schemas['Role'];
