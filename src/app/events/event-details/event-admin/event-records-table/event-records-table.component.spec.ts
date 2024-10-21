import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRecordsTableComponent } from './event-records-table.component';

describe('EventRecordsTableComponent', () => {
  let component: EventRecordsTableComponent;
  let fixture: ComponentFixture<EventRecordsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRecordsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventRecordsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
