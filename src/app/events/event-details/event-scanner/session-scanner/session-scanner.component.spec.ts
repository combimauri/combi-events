import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionScannerComponent } from './session-scanner.component';

describe('SessionScannerComponent', () => {
  let component: SessionScannerComponent;
  let fixture: ComponentFixture<SessionScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
