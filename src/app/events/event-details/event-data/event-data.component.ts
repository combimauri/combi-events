import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services';
import { EventRecordState, EventState, LoadingState } from '@core/states';
import { EventAdminButtonComponent } from './event-admin-button/event-admin-button.component';
import { EventClosedCardComponent } from './event-closed-card/event-closed-card.component';
import { EventFeaturedProductsComponent } from './event-featured-products/event-featured-products.component';
import { EventLocationComponent } from './event-location/event-location.component';
import { EventLoginButtonComponent } from './event-login-button/event-login-button.component';
import { EventMainInfoComponent } from './event-main-info/event-main-info.component';
import { EventRegistrationButtonComponent } from './event-registration-button/event-registration-button.component';
import { EventScannerButtonComponent } from './event-scanner-button/event-scanner-button.component';
import { UserEventRecordComponent } from './user-event-record/user-event-record.component';

@Component({
  selector: 'combi-event-data',
  standalone: true,
  imports: [
    EventAdminButtonComponent,
    EventClosedCardComponent,
    EventFeaturedProductsComponent,
    EventLocationComponent,
    EventLoginButtonComponent,
    EventMainInfoComponent,
    EventRegistrationButtonComponent,
    EventScannerButtonComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    UserEventRecordComponent,
  ],
  template: `
    @if (event(); as event) {
      <combi-event-main-info [event]="event" />

      @if (user(); as user) {
        @if (user.email === event.owner) {
          <combi-event-admin-button />
          <combi-event-scanner-button />
        } @else {
          @if (event.admins.includes(user.email!)) {
            <combi-event-admin-button />
            <combi-event-scanner-button />
          }

          @if (eventRecord(); as record) {
            <combi-user-event-record [eventRecord]="record" />

            @if (event.hasMarketplace) {
              <combi-featured-products [event]="event" />
            }
          } @else {
            @if (event.openRegistration) {
              <combi-event-registration-button />
            } @else {
              <combi-event-closed-card />
            }
          }
        }
      } @else {
        <combi-event-login-button [eventId]="event.id" />
      }

      <combi-event-location [event]="event" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventDataComponent {
  readonly #user$ = inject(AuthService).user$;

  readonly loading = inject(LoadingState).loading;
  readonly event = inject(EventState).event;
  readonly user = toSignal(this.#user$);
  readonly eventRecord = inject(EventRecordState).eventRecord;
}
