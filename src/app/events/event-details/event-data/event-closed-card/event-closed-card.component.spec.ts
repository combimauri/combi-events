import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventClosedCardComponent } from './event-closed-card.component';

describe('EventClosedCardComponent', () => {
  let component: EventClosedCardComponent;
  let fixture: ComponentFixture<EventClosedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventClosedCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventClosedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
