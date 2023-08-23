import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
