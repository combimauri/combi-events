import { ComponentFixture, TestBed } from '@angular/core/testing';
import EventMarketplaceComponent from './event-marketplace.component';

describe('EventMarketplaceComponent', () => {
  let component: EventMarketplaceComponent;
  let fixture: ComponentFixture<EventMarketplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMarketplaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
