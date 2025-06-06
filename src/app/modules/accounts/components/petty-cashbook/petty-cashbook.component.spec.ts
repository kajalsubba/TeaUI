import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PettyCashbookComponent } from './petty-cashbook.component';

describe('PettyCashbookComponent', () => {
  let component: PettyCashbookComponent;
  let fixture: ComponentFixture<PettyCashbookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PettyCashbookComponent]
    });
    fixture = TestBed.createComponent(PettyCashbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
