import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPasswordChangeComponent } from './client-password-change.component';

describe('ClientPasswordChangeComponent', () => {
  let component: ClientPasswordChangeComponent;
  let fixture: ComponentFixture<ClientPasswordChangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientPasswordChangeComponent]
    });
    fixture = TestBed.createComponent(ClientPasswordChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
