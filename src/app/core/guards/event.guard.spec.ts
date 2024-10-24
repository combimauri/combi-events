import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { eventGuard } from './event.guard';

describe('eventGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => eventGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
