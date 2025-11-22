import { TestBed } from '@angular/core/testing';

import { TargetcollectionService } from './targetcollection.service';

describe('TargetcollectionService', () => {
  let service: TargetcollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TargetcollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
