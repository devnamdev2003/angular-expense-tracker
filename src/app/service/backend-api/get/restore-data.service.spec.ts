import { TestBed } from '@angular/core/testing';

import { RestoreDataService } from './restore-data.service';


describe('RestoreDataService', () => {
  let service: RestoreDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestoreDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
