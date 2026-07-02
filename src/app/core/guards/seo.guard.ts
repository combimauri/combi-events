import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { EventSeoData, SeoService } from '@core/services';
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

type EventSeoSnapshot = Omit<EventSeoData, 'path'>;

// Browser-only cache: `runGuardsAndResolvers: 'always'` re-runs this guard
// on every navigation, and without the cache each in-app route change would
// block on (and bill for) a fresh Firestore read. The server never uses it —
// a long-lived SSR process would otherwise serve stale event data, and each
// server request only navigates once anyway. `null` means "event not found"
// so missing events are not re-fetched either.
const eventSeoCache = new Map<string, EventSeoSnapshot | null>();

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

export const seoGuard: CanActivateFn = (route) => {
  const seoService = inject(SeoService);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const eventId = findEventId(route);

  if (!eventId) {
    seoService.resetTags();

    return of(true);
  }

  // The canonical/og URL is always the event page itself (never sub-routes
  // like /register or /admin, which are auth-gated shells, and never query
  // params like ?couponId=..., which would fragment the canonical).
  const applyTags = (event: EventSeoSnapshot | null): true => {
    if (event) {
      seoService.setEventTags({ ...event, path: `/${eventId}` });
    } else {
      seoService.resetTags();
    }

    return true;
  };

  const cached = isBrowser ? eventSeoCache.get(eventId) : undefined;

  if (cached !== undefined) {
    return of(applyTags(cached));
  }

  const firestore = getSeoFirestore();
  const eventDoc = doc(firestore, 'events', eventId);

  return from(getDoc(eventDoc)).pipe(
    map((snapshot) => {
      const event = snapshot.data();
      const seoData: EventSeoSnapshot | null = event
        ? {
            name: event['name'],
            shortDescription: event['shortDescription'],
            image: event['image'] || event['bannerImage'],
          }
        : null;

      if (isBrowser) {
        eventSeoCache.set(eventId, seoData);
      }

      return applyTags(seoData);
    }),
    // Errors are not cached: a transient network failure should not pin the
    // default tags for the rest of the session.
    catchError(() => of(applyTags(null))),
  );
};
