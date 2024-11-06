import { TestBed } from '@angular/core/testing';
import { SessionRecordsState } from './session-records.state';

describe('SessionRecordsState', () => {
  let service: SessionRecordsState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionRecordsState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
