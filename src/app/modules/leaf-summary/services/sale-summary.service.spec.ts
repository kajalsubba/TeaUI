import { TestBed } from '@angular/core/testing';

import { SaleSummaryService } from './sale-summary.service';

describe('SaleSummaryService', () => {
  let service: SaleSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
