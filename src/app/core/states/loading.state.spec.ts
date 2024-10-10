import { TestBed } from '@angular/core/testing';
import { LoadingState } from './loading.state';

describe('LoadingService', () => {
  let service: LoadingState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
