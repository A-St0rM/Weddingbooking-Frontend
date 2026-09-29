import { ApiError } from '@/lib/api/errors';

/** Saves a file the API sent. An anchor click, because a window opened after an await is blocked on iPhone. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function fileFrom(request: Promise<{ data?: unknown; response: Response }>): Promise<Blob> {
  let result;
  try {
    result = await request;
  } catch (thrown) {
    if (thrown instanceof ApiError) throw thrown;
    throw new ApiError(ApiError.Unreachable, 'Kunne ikke få forbindelse til serveren.');
  }
  if (!result.response.ok || !(result.data instanceof Blob)) {
    throw new ApiError(result.response.status, `Kunne ikke hente filen (HTTP ${result.response.status}).`);
  }
  return result.data;
}
