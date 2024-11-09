import { TestBed } from '@angular/core/testing';
import { SessionForScanState } from './session-for-scan.state';

describe('SessionForScanState', () => {
  let service: SessionForScanState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionForScanState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
