import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { vi } from 'vitest';

import { globalAppConfig } from '../../../../../environments/global-app-config';
import { resourceSelector } from '../../../../resource-address';

import { DoiSaverComponent } from './doi-saver.component';

describe('DoiSaverComponent', () => {
  let component: DoiSaverComponent;
  let fixture: ComponentFixture<DoiSaverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoiSaverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoiSaverComponent);
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
      component.saveDoi({ stopPropagation() {} });
      expect(component.errorMessage).toBe('Error Saving A Draft DOI - ' + text);
      expect(component.showError).toBe(true);
    });
  }
});

// The action sends the metadata the editor holds when it is taken, for the artifact by its compact address.
describe('DoiSaverComponent request', () => {
  const metadata = { 'schema:isBasedOn': 'https://repo.metadatacenter.org/templates/datacite', publisher: { '@value': 'Typed publisher' } };
  const source = 'https://repo.metadatacenter.org/templates/7c1e2b5a-0d4f-4e8b-9a36-2f5d8c1b7e94';
  let editor: HTMLElement;
  let bridgeUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [DoiSaverComponent], providers: [provideHttpClient(), provideHttpClientTesting()] });
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

  it('saves the draft DOI from the editor\'s current metadata', () => {
    const fixture = TestBed.createComponent(DoiSaverComponent);
    fixture.componentInstance.sourceArtifactId = source;
    fixture.componentInstance.saveDoi({ stopPropagation() {} });
    const request = TestBed.inject(HttpTestingController).expectOne(() => true);
    expect(request.request.method).toBe('POST');
    // The browser suite pins the compact address a configured deployment gives; here none is configured.
    const url = new URL(request.request.url);
    expect(url.origin + url.pathname).toBe('https://bridge.test/datacite/create-doi');
    expect(url.searchParams.get('source_artifact_id')).toBe(resourceSelector(source));
    expect(url.searchParams.get('state')).toBe('draft');
    expect(request.request.body).toEqual(metadata);
    request.flush({ doiName: '10.82658/9kq4-2zt7' });
    expect(fixture.componentInstance.successMessage).toBe('Draft DOI saved successfully! The DOI is:  10.82658/9kq4-2zt7');
  });
});
