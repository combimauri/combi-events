import { TestBed } from '@angular/core/testing';
import { EventRecordState } from './event-record.state';

describe('EventRecordState', () => {
  let service: EventRecordState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventRecordState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
