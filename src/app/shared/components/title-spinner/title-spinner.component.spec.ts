import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TitleSpinnerComponent } from './title-spinner.component';

describe('TitleSpinnerComponent', () => {
  let component: TitleSpinnerComponent;
  let fixture: ComponentFixture<TitleSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleSpinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
