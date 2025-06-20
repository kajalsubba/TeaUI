import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryAccountComponent } from './factory-account.component';

describe('FactoryAccountComponent', () => {
  let component: FactoryAccountComponent;
  let fixture: ComponentFixture<FactoryAccountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FactoryAccountComponent]
    });
    fixture = TestBed.createComponent(FactoryAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
