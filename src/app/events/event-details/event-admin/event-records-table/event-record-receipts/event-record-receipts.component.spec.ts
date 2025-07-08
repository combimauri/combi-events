import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRecordReceiptsComponent } from './event-record-receipts.component';

describe('EventRecordReceiptsComponent', () => {
  let component: EventRecordReceiptsComponent;
  let fixture: ComponentFixture<EventRecordReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventRecordReceiptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventRecordReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
