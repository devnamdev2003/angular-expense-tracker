import { TestBed } from '@angular/core/testing';

import { SaavanService } from './saavan.service'

describe('SaavanService', () => {
  let service: SaavanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaavanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
