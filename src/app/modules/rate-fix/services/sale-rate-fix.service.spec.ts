import { TestBed } from '@angular/core/testing';

import { SaleRateFixService } from './sale-rate-fix.service';

describe('SaleRateFixService', () => {
  let service: SaleRateFixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleRateFixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
