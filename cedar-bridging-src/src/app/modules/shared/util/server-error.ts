import { HttpErrorResponse } from '@angular/common/http';

/**
 * What a failed request says went wrong. CEDAR services explain a refusal in `message`; a failure
 * that never reached a service has no body, so its status says what happened instead.
 */
export function serverErrorText(error: unknown): string {
  const body = error instanceof HttpErrorResponse ? error.error : (error as { error?: unknown } | null)?.error;
  const upstreamStatus = upstreamFailureStatus(body, error);
  if (upstreamStatus) return `the server answered with status ${upstreamStatus}`;
  if (body && typeof body === 'object') {
    for (const field of ['message', 'errorMessage']) {
      const text = (body as Record<string, unknown>)[field];
      if (typeof text === 'string' && text.trim()) return text.trim();
    }
  }
  if (typeof body === 'string' && body.trim()) return body.trim();
  const status = error instanceof HttpErrorResponse ? error.status : undefined;
  if (status === 0) return 'the server could not be reached';
  if (status) return `the server answered with status ${status}`;
  return 'the request failed';
}

/** CEDAR's error body for a failure of a service behind the bridge. */
interface UpstreamFailure {
  errorKey: 'upstreamServerError';
  parameters?: { upstreamStatusCode?: unknown } | null;
}

function isUpstreamFailure(body: unknown): body is UpstreamFailure {
  return typeof body === 'object' && body !== null && 'errorKey' in body && body.errorKey === 'upstreamServerError';
}

/**
 * The status to report for a failure of a service behind the bridge, or undefined for any other error.
 *
 * The bridge once relayed DataCite's refusals in DataCite's own body and refused a resource answer it
 * could not use without a message, so the form reported both by status. It now answers both in CEDAR's
 * error body, with the key upstreamServerError and a message, and the form still reports them by
 * status: DataCite's own, which the body names, or else the status of the answer.
 */
function upstreamFailureStatus(body: unknown, error: unknown): number | undefined {
  if (!isUpstreamFailure(body)) return undefined;
  const upstream = body.parameters?.upstreamStatusCode;
  if (typeof upstream === 'number') return upstream;
  return error instanceof HttpErrorResponse && error.status ? error.status : undefined;
}
