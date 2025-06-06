import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PettyCashbookHistoryComponent } from './petty-cashbook-history.component';

describe('PettyCashbookHistoryComponent', () => {
  let component: PettyCashbookHistoryComponent;
  let fixture: ComponentFixture<PettyCashbookHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PettyCashbookHistoryComponent]
    });
    fixture = TestBed.createComponent(PettyCashbookHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
