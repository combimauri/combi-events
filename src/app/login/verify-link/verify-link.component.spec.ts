import { ComponentFixture, TestBed } from '@angular/core/testing';
import VerifyLinkComponent from './verify-link.component';

describe('VerifyLinkComponent', () => {
  let component: VerifyLinkComponent;
  let fixture: ComponentFixture<VerifyLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyLinkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
