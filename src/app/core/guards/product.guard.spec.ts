import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { productGuard } from './product.guard';

describe('productGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => productGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
