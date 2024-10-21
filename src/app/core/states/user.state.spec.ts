import { TestBed } from '@angular/core/testing';
import { UserState } from './user.state';

describe('UserService', () => {
  let service: UserState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
