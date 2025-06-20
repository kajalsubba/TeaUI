import { TestBed } from '@angular/core/testing';

import { StgRateFixService } from './stg-rate-fix.service';

describe('StgRateFixService', () => {
  let service: StgRateFixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgRateFixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
