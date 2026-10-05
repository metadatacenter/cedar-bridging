import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { vi } from 'vitest';

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
