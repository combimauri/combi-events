import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';
import { exitRegistrationGuard } from './exit-registration.guard';

describe('exitRegistrationGuard', () => {
  const executeGuard: CanDeactivateFn<{ canDeactivate: () => boolean }> = (
    ...guardParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      exitRegistrationGuard(...guardParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
