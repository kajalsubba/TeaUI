import { TestBed } from '@angular/core/testing';

import { SuppilerHistoryService } from './suppiler-history.service';

describe('SuppilerHistoryService', () => {
  let service: SuppilerHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuppilerHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
