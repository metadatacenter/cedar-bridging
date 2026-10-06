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
});
