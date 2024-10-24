import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { EventRecord } from '@core/models';
import { eventRecordResolver } from './event-record.resolver';

describe('eventRecordResolver', () => {
  const executeResolver: ResolveFn<EventRecord | undefined> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      eventRecordResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
