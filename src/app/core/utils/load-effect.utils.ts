import { inject } from '@angular/core';
import { LoadingState } from '@core/states';

export const loadEffect = () => {
  const loadingState = inject(LoadingState);

  return {
    subscribe: () => loadingState.startLoading(),
    finalize: () => loadingState.stopLoading(),
  };
};
