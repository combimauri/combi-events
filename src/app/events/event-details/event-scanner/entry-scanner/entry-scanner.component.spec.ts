import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntryScannerComponent } from './entry-scanner.component';

describe('EntryScannerComponent', () => {
  let component: EntryScannerComponent;
  let fixture: ComponentFixture<EntryScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryScannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EntryScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
