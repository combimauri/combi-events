import { TestBed } from '@angular/core/testing';
import { ProductRecordState } from './product-record.state';

describe('ProductRecordState', () => {
  let service: ProductRecordState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductRecordState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
