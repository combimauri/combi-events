import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { platformGuard } from './platform.guard';

describe('platformGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => platformGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
