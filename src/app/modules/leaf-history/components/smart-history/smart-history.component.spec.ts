import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartHistoryComponent } from './smart-history.component';

describe('SmartHistoryComponent', () => {
  let component: SmartHistoryComponent;
  let fixture: ComponentFixture<SmartHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SmartHistoryComponent]
    });
    fixture = TestBed.createComponent(SmartHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
