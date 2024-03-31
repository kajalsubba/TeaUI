import { TestBed } from '@angular/core/testing';

import { SupplierBillService } from './supplier-bill.service';

describe('SupplierBillService', () => {
  let service: SupplierBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
