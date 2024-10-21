import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRegistrationPaymentComponent } from './event-registration-payment.component';

describe('EventRegistrationPaymentComponent', () => {
  let component: EventRegistrationPaymentComponent;
  let fixture: ComponentFixture<EventRegistrationPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRegistrationPaymentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventRegistrationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
