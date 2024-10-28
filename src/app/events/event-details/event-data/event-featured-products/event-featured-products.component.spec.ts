import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFeaturedProductsComponent } from './event-featured-products.component';

describe('EventFeaturedProductsComponent', () => {
  let component: EventFeaturedProductsComponent;
  let fixture: ComponentFixture<EventFeaturedProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFeaturedProductsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventFeaturedProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
