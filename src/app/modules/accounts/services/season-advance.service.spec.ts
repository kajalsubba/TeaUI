import { TestBed } from '@angular/core/testing';

import { SeasonAdvanceService } from './season-advance.service';

describe('SeasonAdvanceService', () => {
  let service: SeasonAdvanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeasonAdvanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
