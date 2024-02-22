import { TestBed } from '@angular/core/testing';

import { SupplierapproveService } from './supplierapprove.service';

describe('SupplierapproveService', () => {
  let service: SupplierapproveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierapproveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
