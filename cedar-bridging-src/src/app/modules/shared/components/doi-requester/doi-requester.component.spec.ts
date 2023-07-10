import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoiRequestorComponent } from './doi-requester.component';

describe('DoiRequestorComponent', () => {
  let component: DoiRequestorComponent;
  let fixture: ComponentFixture<DoiRequestorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoiRequestorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoiRequestorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
