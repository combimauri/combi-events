import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { eventsResolver } from './events.resolver';
import { Event } from '../models/event.model';

describe('eventsResolver', () => {
  const executeResolver: ResolveFn<Event | undefined> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() => eventsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
