import { TestBed } from '@angular/core/testing';
import { SessionRecordsService } from './session-records.service';

describe('SessionRecordsService', () => {
  let service: SessionRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
