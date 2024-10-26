import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRecordNotesComponent } from './event-record-notes.component';

describe('EventRecordNotesComponent', () => {
  let component: EventRecordNotesComponent;
  let fixture: ComponentFixture<EventRecordNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRecordNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventRecordNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
