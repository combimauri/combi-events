import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventAdminButtonComponent } from './event-admin-button.component';

describe('EventAdminButtonComponent', () => {
  let component: EventAdminButtonComponent;
  let fixture: ComponentFixture<EventAdminButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAdminButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventAdminButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
