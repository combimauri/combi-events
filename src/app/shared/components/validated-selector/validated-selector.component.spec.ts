import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidatedSelectorComponent } from './validated-selector.component';

describe('ValidatedSelectorComponent', () => {
  let component: ValidatedSelectorComponent;
  let fixture: ComponentFixture<ValidatedSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatedSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidatedSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
