import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventSessionsTableComponent } from './event-sessions-table.component';

describe('EventSessionsTableComponent', () => {
  let component: EventSessionsTableComponent;
  let fixture: ComponentFixture<EventSessionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSessionsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventSessionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
