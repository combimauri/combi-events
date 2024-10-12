import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserEventRecordComponent } from './user-event-record.component';

describe('UserEventRecordComponent', () => {
  let component: UserEventRecordComponent;
  let fixture: ComponentFixture<UserEventRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEventRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEventRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
