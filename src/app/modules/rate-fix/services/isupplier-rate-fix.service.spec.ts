import { TestBed } from '@angular/core/testing';

import { IsupplierRateFixService } from './isupplier-rate-fix.service';

describe('IsupplierRateFixService', () => {
  let service: IsupplierRateFixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsupplierRateFixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
