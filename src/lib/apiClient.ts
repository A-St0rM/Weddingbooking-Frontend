import { getSupabaseClient } from '@/lib/supabase';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Empty by default: in development Vite proxies /api to the backend, so no
 * configuration is needed and there is no CORS. Deployments set it explicitly.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * The single way this app talks to anything. Attaches the session token when
 * there is one; until login exists (ticket 03) there is not, and the API
 * accepts anonymous calls.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = getSupabaseClient();
  const token = supabase
    ? (await supabase.auth.getSession()).data.session?.access_token
    : undefined;

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // A 200 carrying HTML means something answered that is not the API — a SPA
  // fallback, a login redirect, a proxy error page. Parsing it as JSON throws
  // somewhere far from the cause, so say plainly what happened instead.
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    throw new ApiError(
      response.status,
      `Forventede JSON fra ${path}, men fik ${contentType || 'ingen content-type'}. ` +
        'Peger frontenden på det rigtige API?',
    );
  }

  return (await response.json()) as T;
}
