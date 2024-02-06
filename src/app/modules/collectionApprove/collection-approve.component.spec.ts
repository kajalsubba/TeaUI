import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionApproveComponent } from './collection-approve.component';

describe('CollectionApproveComponent', () => {
  let component: CollectionApproveComponent;
  let fixture: ComponentFixture<CollectionApproveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionApproveComponent]
    });
    fixture = TestBed.createComponent(CollectionApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
