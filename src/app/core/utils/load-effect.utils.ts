import { inject } from '@angular/core';
import { LoadingState } from '../states/loading.state';

export const loadEffect = () => {
  const loadingState = inject(LoadingState);

  return {
    subscribe: () => loadingState.startLoading(),
    tap: () => loadingState.stopLoading(),
    finalize: () => loadingState.stopLoading(),
  };
};
