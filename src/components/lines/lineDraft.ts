import type { LinePricing, LineRequest, ProductGroup } from '@/lib/api/types';
import { kronerInput, parseKroner } from '@/lib/format';

export interface LineDraft {
  description: string;
  group: ProductGroup;
  pricing: LinePricing;
  unitPrice: string;
  quantity: string;
  minimumQuantity: string;
}

export const emptyLine: LineDraft = {
  description: '',
  group: 'DinnerAndParty',
  pricing: 'PerGuest',
  unitPrice: '',
  quantity: '1',
  minimumQuantity: '',
};

export function toDraft(line: { description: string; group: ProductGroup; pricing: LinePricing; unitPrice: number; quantity: number; minimumQuantity?: number | null }): LineDraft {
  return {
    description: line.description,
    group: line.group,
    pricing: line.pricing,
    unitPrice: kronerInput(line.unitPrice),
    quantity: String(line.quantity),
    minimumQuantity: line.minimumQuantity ? String(line.minimumQuantity) : '',
  };
}

/** The request for a draft, or null while it is incomplete. The API checks the rules. */
export function toRequest(draft: LineDraft): LineRequest | null {
  const unitPrice = parseKroner(draft.unitPrice);
  const quantity = draft.pricing === 'PerGuest' ? 1 : Number.parseInt(draft.quantity, 10);
  const minimum = draft.minimumQuantity ? Number.parseInt(draft.minimumQuantity, 10) : null;
  if (!draft.description.trim() || unitPrice === null || !(quantity >= 1)) return null;
  return {
    description: draft.description.trim(),
    group: draft.group,
    pricing: draft.pricing,
    unitPrice,
    quantity,
    minimumQuantity: draft.pricing === 'Fixed' ? minimum : null,
  };
}
