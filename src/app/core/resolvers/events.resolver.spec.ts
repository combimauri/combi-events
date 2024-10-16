import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { AppEvent } from '@core/models';
import { eventsResolver } from './events.resolver';

describe('eventsResolver', () => {
  const executeResolver: ResolveFn<AppEvent | undefined> = (
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
