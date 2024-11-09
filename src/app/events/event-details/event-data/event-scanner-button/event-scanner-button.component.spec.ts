import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventScannerButtonComponent } from './event-scanner-button.component';

describe('EventScannerButtonComponent', () => {
  let component: EventScannerButtonComponent;
  let fixture: ComponentFixture<EventScannerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventScannerButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventScannerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
