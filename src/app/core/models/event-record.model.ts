import { Timestamp } from '@angular/fire/firestore';
import { BillingRecord } from './billing-record.model';

export interface PartialEventRecord extends BillingRecord {
  eventId: string;
  orderId: string;
  paymentId: string;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  validated: boolean;
}

export interface EventRecordListing {
  items: EventRecord[];
  total: number;
}
