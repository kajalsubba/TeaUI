import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierapproveComponent } from './supplierapprove.component';

describe('SupplierapproveComponent', () => {
  let component: SupplierapproveComponent;
  let fixture: ComponentFixture<SupplierapproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierapproveComponent]
    });
    fixture = TestBed.createComponent(SupplierapproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
