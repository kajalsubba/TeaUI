import { TestBed } from '@angular/core/testing';

import { StgBillService } from './stg-bill.service';

describe('StgBillService', () => {
  let service: StgBillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgBillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
