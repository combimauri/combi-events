import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductRecord } from '@core/models';
import { AuthService, ProductRecordsService } from '@core/services';
import { ProductRecordState, ProductState } from '@core/states';
import { of, switchMap, tap } from 'rxjs';

export const productRecordResolver: ResolveFn<
  ProductRecord | undefined
> = () => {
  const product = inject(ProductState).product()!;
  const productRecordsService = inject(ProductRecordsService);
  const productRecordState = inject(ProductRecordState);
  const user$ = inject(AuthService).user$;

  return user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(undefined);
      }

      return productRecordsService.getRecordByProductIdAndEmail(
        product.id,
        user?.email!,
      );
    }),
    tap((productRecord) =>
      saveProductRecordState(productRecordState, productRecord),
    ),
  );
};

const saveProductRecordState = (
  productRecordState: ProductRecordState,
  productRecord?: ProductRecord,
) => {
  if (productRecord) {
    productRecordState.setProductRecord(productRecord);
  } else {
    productRecordState.clearProductRecord();
  }
};
