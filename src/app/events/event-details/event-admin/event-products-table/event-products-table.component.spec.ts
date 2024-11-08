import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventProductsTableComponent } from './event-products-table.component';

describe('EventProductsTableComponent', () => {
  let component: EventProductsTableComponent;
  let fixture: ComponentFixture<EventProductsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventProductsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventProductsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
