import { TestBed } from '@angular/core/testing';

import { SaavnService } from './saavan.service'

describe('SaavanService', () => {
  let service: SaavnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaavnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
