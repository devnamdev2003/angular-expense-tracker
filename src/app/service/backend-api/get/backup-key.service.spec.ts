import { TestBed } from '@angular/core/testing';

import { BackupKeyService } from './backup-key.service';

describe('BackupKeyService', () => {
  let service: BackupKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
