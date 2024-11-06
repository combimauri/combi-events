import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { sessionRecordsResolver } from './session-records.resolver';

describe('sessionRecordsResolver', () => {
  const executeResolver: ResolveFn<
    SessionRecord[] | RedirectCommand | undefined
  > = (...resolverParameters) =>
    TestBed.runInInjectionContext(() =>
      sessionRecordsResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
