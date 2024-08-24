import { TestBed } from '@angular/core/testing';

import { StgBagService } from './stg-bag.service';

describe('StgBagService', () => {
  let service: StgBagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgBagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
