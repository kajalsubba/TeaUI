import { TestBed } from '@angular/core/testing';

import { FactoryAccountService } from './factory-account.service';

describe('FactoryAccountService', () => {
  let service: FactoryAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactoryAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
