/**
 * Every failed call becomes an ApiError with a status, so the UI can tell a
 * refusal (403) from a server that is not answering. Treating every error as
 * "no access" sends people looking through user accounts for a network problem.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** The request never got an answer: network down, API stopped, DNS. */
  static readonly Unreachable = 0;

  get isForbidden() {
    return this.status === 403;
  }

  get isUnreachable() {
    return this.status === ApiError.Unreachable || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

interface ProblemBody {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

/** The human-readable text of a ProblemDetails body, if there is one. */
export function describeProblem(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const problem = body as ProblemBody;
  if (problem.errors) {
    return Object.values(problem.errors).flat().join(' ');
  }
  return problem.detail ?? problem.title;
}
