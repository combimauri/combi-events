import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { SeoService } from '@core/services';
import { environment } from '@env/environment';
import { getApps, initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
import { catchError, from, map, of } from 'rxjs';

// A separate, lite Firebase app is used here (instead of the main
// `@angular/fire` providers) because the full Firestore SDK relies on
// long-lived connections/IndexedDB that never resolve during SSR (that's
// why platformGuard exists on content routes). Firestore Lite is a plain
// fetch-based client built for exactly this kind of one-off read, so it
// works reliably on both the server and the browser.
//
// This runs as a guard (not a resolver): Angular's router evaluates every
// canActivate guard for the whole matched tree before running any
// resolvers, so a descendant's platformGuard rejecting would otherwise
// prevent an ancestor resolver from ever running. A guard on this ancestor
// route is evaluated before that descendant guard and always allows
// navigation, so the meta tags are set regardless of what happens deeper
// in the tree.
const SEO_APP_NAME = 'combi-events-seo';

const getSeoFirestore = () => {
  const app =
    getApps().find((existingApp) => existingApp.name === SEO_APP_NAME) ??
    initializeApp(environment.firebase, SEO_APP_NAME);

  return getFirestore(app);
};

const findEventId = (route: ActivatedRouteSnapshot): string | undefined => {
  let current: ActivatedRouteSnapshot | null = route;

  while (current) {
    const eventId = current.paramMap.get('eventId');

    if (eventId) {
      return eventId;
    }

    current = current.firstChild;
  }

  return undefined;
};

export const seoGuard: CanActivateFn = (route, state) => {
  const seoService = inject(SeoService);
  const eventId = findEventId(route);

  if (!eventId) {
    seoService.resetTags();

    return of(true);
  }

  const firestore = getSeoFirestore();
  const eventDoc = doc(firestore, 'events', eventId);

  return from(getDoc(eventDoc)).pipe(
    map((snapshot) => {
      const event = snapshot.data();

      if (!event) {
        seoService.resetTags();

        return true;
      }

      seoService.setEventTags({
        name: event['name'],
        shortDescription: event['shortDescription'],
        image: event['bannerImage'] || event['image'],
        path: state.url,
      });

      return true;
    }),
    catchError(() => {
      seoService.resetTags();

      return of(true);
    }),
  );
};
