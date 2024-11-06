import { ComponentFixture, TestBed } from '@angular/core/testing';
import EventSessionsComponent from './event-sessions.component';

describe('EventSessionsComponent', () => {
  let component: EventSessionsComponent;
  let fixture: ComponentFixture<EventSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSessionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
