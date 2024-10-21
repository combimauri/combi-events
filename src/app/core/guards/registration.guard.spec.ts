import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { registrationGuard } from './registration.guard';

describe('registrationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => registrationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
