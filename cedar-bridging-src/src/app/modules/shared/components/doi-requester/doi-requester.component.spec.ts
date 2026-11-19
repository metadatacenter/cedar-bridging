import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { vi } from 'vitest';

import { globalAppConfig } from '../../../../../environments/global-app-config';
import { resourceSelector } from '../../../../resource-address';

import { DoiRequesterComponent } from './doi-requester.component';

describe('DoiRequestorComponent', () => {
  let component: DoiRequesterComponent;
  let fixture: ComponentFixture<DoiRequesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoiRequesterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoiRequesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // The bridge explains a refusal in `message`; a failure that reached no server has no body.
  for (const [name, error, text] of [
    ['a refusal', new HttpErrorResponse({ status: 409, error: { errorKey: 'doiAlreadyExists', message: 'The template already has a DOI' } }), 'The template already has a DOI'],
    ['a server error without a body', new HttpErrorResponse({ status: 500, error: null }), 'the server answered with status 500'],
    ['a network failure', new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }), 'the server could not be reached'],
  ] as const) {
    it(`says what went wrong after ${name}`, () => {
      vi.spyOn(component as any, 'httpRequest').mockReturnValue(throwError(() => error));
      component.createDoi({ stopPropagation() {} });
      expect(component.errorMessage).toBe('Error Creating A DOI - ' + text);
      expect(component.showError).toBe(true);
    });
  }
});

// The action sends the metadata the editor holds when it is taken, for the artifact by its compact address.
describe('DoiRequesterComponent request', () => {
  const metadata = { 'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/datacite', publisher: { '@value': 'Typed publisher' } };
  const source = 'https://repo.metadatacenter.org/templates/7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';
  let editor: HTMLElement;
  let bridgeUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [DoiRequesterComponent], providers: [provideHttpClient(), provideHttpClientTesting()] });
    editor = document.createElement('cedar-embeddable-editor');
    Object.defineProperty(editor, 'currentMetadata', { get: () => metadata });
    document.body.append(editor);
    bridgeUrl = globalAppConfig.bridgeUrl;
    globalAppConfig.bridgeUrl = 'https://bridge.test/';
  });

  afterEach(() => {
    editor.remove();
    globalAppConfig.bridgeUrl = bridgeUrl;
    TestBed.inject(HttpTestingController).verify();
  });

  it('creates the DOI from the editor\'s current metadata', () => {
    const fixture = TestBed.createComponent(DoiRequesterComponent);
    fixture.componentInstance.sourceArtifactId = source;
    fixture.componentInstance.createDoi({ stopPropagation() {} });
    const request = TestBed.inject(HttpTestingController).expectOne(() => true);
    expect(request.request.method).toBe('POST');
    // The browser suite pins the compact address a configured deployment gives; here none is configured.
    const url = new URL(request.request.url);
    expect(url.origin + url.pathname).toBe('https://bridge.test/datacite/create-doi');
    expect(url.searchParams.get('source_artifact_id')).toBe(resourceSelector(source));
    expect(url.searchParams.get('state')).toBe('publish');
    expect(request.request.body).toEqual(metadata);
    request.flush({ doiName: '10.82658/9kq4-2zt7' });
    expect(fixture.componentInstance.successMessage).toBe('DOI created successfully! The DOI is:  10.82658/9kq4-2zt7');
  });

  // A DOI is registered once: a click while the request is pending asks the bridge nothing more.
  it('sends nothing more while its request is pending, and again once it is answered', () => {
    const fixture = TestBed.createComponent(DoiRequesterComponent);
    const backend = TestBed.inject(HttpTestingController);
    fixture.componentInstance.sourceArtifactId = source;
    fixture.componentInstance.createDoi({ stopPropagation() {} });
    fixture.componentInstance.createDoi({ stopPropagation() {} });
    backend.expectOne(() => true).flush({ message: 'DataCite is unavailable' }, { status: 500, statusText: 'Server Error' });
    fixture.componentInstance.createDoi({ stopPropagation() {} });
    backend.expectOne(() => true).flush({ doiName: '10.82658/9kq4-2zt7' });
    expect(fixture.componentInstance.showSuccess).toBe(true);
  });
});
