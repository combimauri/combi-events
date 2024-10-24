import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRegistrationButtonComponent } from './event-registration-button.component';

describe('EventRegistrationButtonComponent', () => {
  let component: EventRegistrationButtonComponent;
  let fixture: ComponentFixture<EventRegistrationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRegistrationButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventRegistrationButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
