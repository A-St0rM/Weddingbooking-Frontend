import { ApiError } from '@/lib/api/errors';

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === ApiError.Unreachable) return 'Serveren svarer ikke. Prøv igen om lidt.';
    return error.detail ?? error.message;
  }
  return 'Noget gik galt.';
}

export const isConflict = (error: unknown) => error instanceof ApiError && error.status === 409;
