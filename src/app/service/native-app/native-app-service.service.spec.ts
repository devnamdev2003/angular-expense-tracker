import { TestBed } from '@angular/core/testing';

import { NativeAppServiceService } from './native-app-service.service';

describe('NativeAppServiceService', () => {
  let service: NativeAppServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NativeAppServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
