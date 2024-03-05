import { TestBed } from '@angular/core/testing';

import { RolePersmissionService } from './role-persmission.service';

describe('RolePersmissionService', () => {
  let service: RolePersmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolePersmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
