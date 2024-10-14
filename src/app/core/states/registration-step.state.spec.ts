import { TestBed } from '@angular/core/testing';
import { RegistrationStepState } from './registration-step.state';

describe('RegistrationStepService', () => {
  let service: RegistrationStepState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistrationStepState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
