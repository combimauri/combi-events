import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserCredential } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services';
import { Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'combi-verify-link',
  standalone: true,
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VerifyLinkComponent implements AfterViewInit {
  readonly #auth = inject(AuthService);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/';
  readonly #verifyAndSignIn$ = new Subject<void>();

  readonly linkAuth = toSignal(
    this.#verifyAndSignIn$.pipe(
      switchMap(() => this.#auth.signInWithEmailLink()),
      tap({ next: (response) => this.handleSignInResponse(response) }),
    ),
  );

  ngAfterViewInit(): void {
    this.#verifyAndSignIn$.next();
  }

  private handleSignInResponse(response: UserCredential | undefined): void {
    if (!response) {
      this.#router.navigate(['..'], { relativeTo: this.#route });
    }

    this.#router.navigateByUrl(this.#returnUrl);
  }
}
