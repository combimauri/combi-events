import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventLoginButtonComponent } from './event-login-button.component';

describe('EventLoginButtonComponent', () => {
  let component: EventLoginButtonComponent;
  let fixture: ComponentFixture<EventLoginButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventLoginButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLoginButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
