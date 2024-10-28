import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { marketplaceGuard } from './marketplace.guard';

describe('marketplaceGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => marketplaceGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
