import { TestBed } from '@angular/core/testing';
import { ProductRecordsService } from './product-records.service';

describe('ProductRecordsService', () => {
  let service: ProductRecordsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductRecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
