import createClient, { type Middleware } from 'openapi-fetch';
import { getSupabase } from '@/lib/supabase';
import { ApiError, describeProblem } from '@/lib/api/errors';
import type { paths } from '@/lib/api/schema';

/**
 * The single way this app talks to anything. Typed end to end from the API's
 * OpenAPI document: a path, parameter or field that does not exist fails at
 * build time, not in the browser.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const withSession: Middleware = {
  async onRequest({ request }) {
    const session = (await getSupabase()?.auth.getSession())?.data.session;
    if (session) request.headers.set('Authorization', `Bearer ${session.access_token}`);
    return request;
  },
};

/**
 * A 200 carrying HTML means something answered that is not the API — a static
 * host's fallback page, a proxy, a login redirect. Parsing it as JSON fails far
 * from the cause; say plainly what happened instead.
 */
const jsonOnly: Middleware = {
  async onResponse({ response, request }) {
    // Only successful answers are checked. A 401 or 404 has its own status to
    // report, and often no body at all — that is not "the wrong API".
    if (!response.ok || response.status === 204) return response;

    const type = response.headers.get('content-type') ?? '';
    const isFile = type.startsWith('application/pdf') || type.startsWith('application/octet-stream');
    if (!type.includes('json') && !isFile) {
      throw new ApiError(
        response.status,
        `Forventede JSON fra ${new URL(request.url).pathname}, men fik ${type || 'intet'}. Peger appen på det rigtige API?`,
      );
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl });
api.use(withSession, jsonOnly);

/**
 * openapi-fetch returns errors instead of throwing; TanStack Query wants a
 * throw. This turns `{ data, error, response }` into data-or-ApiError, and a
 * failed fetch (API stopped, network down) into status 0.
 */
export async function call<T>(request: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  let result: { data?: T; error?: unknown; response: Response };
  try {
    result = await request;
  } catch (thrown) {
    if (thrown instanceof ApiError) throw thrown;
    throw new ApiError(ApiError.Unreachable, 'Kunne ikke få forbindelse til serveren.');
  }

  const { data, error, response } = result;
  if (!response.ok) {
    throw new ApiError(response.status, describeProblem(error) ?? `Serveren svarede ${response.status}.`, describeProblem(error));
  }
  return data as T;
}
