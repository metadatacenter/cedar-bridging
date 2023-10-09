import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
