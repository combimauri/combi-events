import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CredentialComponent } from './credential.component';

describe('CredentialComponent', () => {
  let component: CredentialComponent;
  let fixture: ComponentFixture<CredentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
