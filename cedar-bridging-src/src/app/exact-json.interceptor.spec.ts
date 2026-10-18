import {TestBed} from '@angular/core/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {firstValueFrom} from 'rxjs';
import {exactJsonInterceptor} from './exact-json.interceptor';

describe('Exact artifact HTTP JSON', () => {
  let http: HttpClient, backend: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(withInterceptors([exactJsonInterceptor])), provideHttpClientTesting()]});
    http = TestBed.inject(HttpClient); backend = TestBed.inject(HttpTestingController);
  });
  afterEach(() => backend.verify());
  it('round-trips source precision through reads and writes', async () => {
    const source = '{"N":9007199254740993,"D":0.10000000000000001}';
    const read = firstValueFrom(http.get('/artifact'));
    const incoming = backend.expectOne('/artifact');
    expect(incoming.request.responseType).toBe('text'); incoming.flush(source);
    const loaded = await read;
    const write = firstValueFrom(http.put('/artifact', loaded));
    const outgoing = backend.expectOne('/artifact');
    expect(outgoing.request.body).toBe(source);
    expect(outgoing.request.headers.get('Content-Type')).toBe('application/json');
    outgoing.flush('{}'); await write;
  });
  it('rejects duplicate decoded keys and incomplete JSON', async () => {
    for (const source of ['{"a":1,"\\u0061":2}', '1,"extra":2', '{} {}', '\u00a0', '   ']) {
      const read = firstValueFrom(http.get('/artifact')).catch(error => error);
      backend.expectOne('/artifact').flush(source);
      const error = await read;
      expect(error.status).toBe(200); expect(error.ok).toBe(false);
    }
  });
  it('keeps structured error bodies and status codes', async () => {
    const read = firstValueFrom(http.get('/artifact')).catch(error => error);
    backend.expectOne('/artifact').flush('{"message":"Conflict"}', {status: 412, statusText: 'Precondition Failed'});
    const error = await read;
    expect(error.status).toBe(412); expect(error.error).toEqual({message: 'Conflict'});
  });
  it('permits JSON arrays and preserves explicitly requested text', async () => {
    const list = firstValueFrom(http.get('/list')); backend.expectOne('/list').flush('[1,2]'); expect(await list).toEqual([1,2]);
    const text = firstValueFrom(http.get('/text', {responseType: 'text'})); backend.expectOne('/text').flush('not JSON'); expect(await text).toBe('not JSON');
  });
});
