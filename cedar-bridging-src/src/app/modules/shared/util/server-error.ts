import { HttpErrorResponse } from '@angular/common/http';

/**
 * What a failed request says went wrong. CEDAR services explain a refusal in `message`; a failure
 * that never reached a service has no body, so its status says what happened instead.
 */
export function serverErrorText(error: unknown): string {
  const body = error instanceof HttpErrorResponse ? error.error : (error as { error?: unknown } | null)?.error;
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
