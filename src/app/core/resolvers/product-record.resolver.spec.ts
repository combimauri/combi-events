import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';
import { ProductRecord } from '@core/models';
import { productRecordResolver } from './product-record.resolver';

describe('productRecordResolver', () => {
  const executeResolver: ResolveFn<ProductRecord | undefined> = (
    ...resolverParameters
  ) =>
    TestBed.runInInjectionContext(() =>
      productRecordResolver(...resolverParameters),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
