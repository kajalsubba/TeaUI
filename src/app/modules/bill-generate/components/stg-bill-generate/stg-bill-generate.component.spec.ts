import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgBillGenerateComponent } from './stg-bill-generate.component';

describe('StgBillGenerateComponent', () => {
  let component: StgBillGenerateComponent;
  let fixture: ComponentFixture<StgBillGenerateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StgBillGenerateComponent]
    });
    fixture = TestBed.createComponent(StgBillGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
