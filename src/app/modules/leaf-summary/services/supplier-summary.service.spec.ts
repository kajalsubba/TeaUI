import { TestBed } from '@angular/core/testing';

import { SupplierSummaryService } from './supplier-summary.service';

describe('SupplierSummaryService', () => {
  let service: SupplierSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
