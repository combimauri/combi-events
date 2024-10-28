import { Timestamp } from '@angular/fire/firestore';
import { BillingRecord } from './billing-record.model';

export interface ProductRecord extends BillingRecord {
  createdAt: Timestamp;
  eventId: string;
  id: string;
  orderId: string;
  paymentId: string;
  productId: string;
  productName: string;
  searchTerm: string;
  updatedAt: Timestamp;
  validated: boolean;
}
