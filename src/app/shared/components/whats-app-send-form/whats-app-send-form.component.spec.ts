import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsappSendFormComponent } from './whats-app-send-form.component';

describe('WhatsAppSendFormComponent', () => {
  let component: WhatsappSendFormComponent;
  let fixture: ComponentFixture<WhatsappSendFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappSendFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappSendFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
