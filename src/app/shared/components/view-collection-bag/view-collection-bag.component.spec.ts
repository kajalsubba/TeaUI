import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCollectionBagComponent } from './view-collection-bag.component';

describe('ViewCollectionBagComponent', () => {
  let component: ViewCollectionBagComponent;
  let fixture: ComponentFixture<ViewCollectionBagComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCollectionBagComponent]
    });
    fixture = TestBed.createComponent(ViewCollectionBagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
