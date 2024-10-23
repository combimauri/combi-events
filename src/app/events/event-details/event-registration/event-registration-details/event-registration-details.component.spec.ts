import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRegistrationDetailsComponent } from './event-registration-details.component';

describe('EventRegistrationDetailsComponent', () => {
  let component: EventRegistrationDetailsComponent;
  let fixture: ComponentFixture<EventRegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRegistrationDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventRegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
