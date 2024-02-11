import { TestBed } from '@angular/core/testing';

import { StgApproveService } from './stg-approve.service';

describe('StgApproveService', () => {
  let service: StgApproveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StgApproveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
