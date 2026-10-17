import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { serverErrorText } from './server-error';

describe('serverErrorText', () => {
  const failure = (status: number, error: unknown) =>
    new HttpErrorResponse({ status, error, headers: new HttpHeaders(), url: 'https://bridge.example/doi' });

  const cases: [string, unknown, string][] = [
    ['a CEDAR error body', failure(409, { errorKey: 'doiAlreadyExists', message: 'A DOI already exists' }), 'A DOI already exists'],
    ['a body naming errorMessage', failure(400, { errorMessage: 'Title is required' }), 'Title is required'],
    ['message before errorMessage', failure(400, { message: 'First', errorMessage: 'Second' }), 'First'],
    ['a blank message', failure(500, { message: '  ' }), 'the server answered with status 500'],
    ['a plain-text body', failure(502, 'Bad gateway'), 'Bad gateway'],
    ['no body', failure(404, null), 'the server answered with status 404'],
    ['a network failure', failure(0, new ProgressEvent('error')), 'the server could not be reached'],
    ['something that is not a response', new Error('boom'), 'the request failed'],
    ['nothing at all', undefined, 'the request failed'],
  ];
  for (const [name, error, text] of cases) {
    it(`explains ${name}`, () => expect(serverErrorText(error)).toBe(text));
  }

  /** The bridge's error body for a service behind it that failed. */
  const upstream = (statusCode: number, message: string, parameters: Record<string, unknown> = {}) => ({
    status: statusCode === 404 ? 'NOT_FOUND' : 'BAD_GATEWAY', statusCode, errorKey: 'upstreamServerError',
    errorReasonKey: null, message,
    parameters, objects: {},
  });
  // Each answer the bridge gave before it used the shared error body, beside the answer it gives now. The
  // form reports both the same way, by the status the service behind the bridge gave.
  const upstreamCases: [string, unknown, unknown, string][] = [
    ['DataCite refusing the request', failure(404, { errors: [{ status: '404', title: 'Not found' }] }),
      failure(404, upstream(404, 'DataCite refused the request with HTTP 404.\nNot found',
        { upstreamStatusCode: 404, upstreamService: 'DataCite' })), 'the server answered with status 404'],
    ['DataCite failing', failure(500, { errors: [] }),
      failure(502, upstream(502, 'DataCite failed with HTTP 500.', { upstreamStatusCode: 500, upstreamService: 'DataCite' })),
      'the server answered with status 500'],
    ['DataCite refusing the repository credential', failure(401, { errors: [{ title: 'Bad credentials' }] }),
      failure(502, upstream(502, 'DataCite refused the repository credentials this server holds (HTTP 401).',
        { upstreamStatusCode: 401, upstreamService: 'DataCite' })), 'the server answered with status 401'],
    ['a resource read the bridge relays', failure(404, { status: 'NOT_FOUND', statusCode: 404, message: null }),
      failure(404, upstream(404, 'The resource server answered HTTP 404 when asked for the template t.')),
      'the server answered with status 404'],
    ['a resource answer the bridge could not use', failure(502, { status: 'BAD_GATEWAY', statusCode: 502, message: null }),
      failure(502, upstream(502, "The resource server's validation of the DataCite metadata gave no verdict.")),
      'the server answered with status 502'],
  ];
  for (const [name, before, after, text] of upstreamCases) {
    it(`explains ${name} as it did before the bridge explained it`, () => {
      expect(serverErrorText(before)).toBe(text);
      expect(serverErrorText(after)).toBe(text);
    });
  }

  it('reads the words of any other error the bridge explains', () => {
    expect(serverErrorText(failure(502, { status: 'BAD_GATEWAY', statusCode: 502, errorKey: null,
      message: 'The DataCite draft lookup failed', parameters: { upstreamStatusCode: 401 } })))
      .toBe('The DataCite draft lookup failed');
  });
});
