import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';

// Necessary guard to prevent SSR errors
export const platformGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  return isPlatformBrowser(platformId);
};
