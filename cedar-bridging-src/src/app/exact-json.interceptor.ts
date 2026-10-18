import {HttpErrorResponse, HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {catchError, map, throwError} from 'rxjs';
import {JsonSourcePolicy} from 'cedar-model-typescript-library/policy';

// Parse raw JSON before HttpClient can round source numbers. A wrapper permits array/scalar replies
// while the shared artifact parser continues to require an object and reject duplicate keys.
function parse(source: string): unknown {
  if (source === '') return null;
  const wrapper = JsonSourcePolicy.parse('{"value":' + source + '}');
  if (Object.keys(wrapper).length !== 1) throw new SyntaxError('Unexpected trailing JSON content');
  return wrapper['value'];
}
export const exactJsonInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.responseType !== 'json') return next(request);
  const type = request.detectContentTypeHeader();
  const body = type === 'application/json' && typeof request.body !== 'string'
    ? JsonSourcePolicy.stringify(request.body) : request.body;
  const headers = type && !request.headers.has('Content-Type') ? request.headers.set('Content-Type', type) : request.headers;
  return next(request.clone({responseType: 'text', body, headers})).pipe(
    map(event => {
      if (!(event instanceof HttpResponse)) return event;
      try { return event.clone({body: typeof event.body === 'string' ? parse(event.body) : event.body}); }
      catch (error) { throw new HttpErrorResponse({error, headers: event.headers, status: event.status, statusText: event.statusText, url: event.url ?? undefined}); }
    }),
    catchError(error => {
      if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
        try { return throwError(() => new HttpErrorResponse({error: parse(error.error), headers: error.headers,
          status: error.status, statusText: error.statusText, url: error.url ?? undefined})); }
        catch { /* Keep non-JSON error bodies and HTTP status intact. */ }
      }
      return throwError(() => error);
    }),
  );
};
