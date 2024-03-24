import { TestBed } from '@angular/core/testing';

import { StgSummaryService } from './stg-summary.service';

describe('StgSummaryService', () => {
  let service: StgSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
