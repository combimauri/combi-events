import { TestBed } from '@angular/core/testing';
import { EventState } from './event.state';

describe('EventState', () => {
  let service: EventState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
