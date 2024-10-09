import { TestBed } from '@angular/core/testing';
import { EventRecordsService } from './event-records.service';

describe('EventRecordsService', () => {
  let service: EventRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
