import { Timestamp } from '@angular/fire/firestore';

export interface BillingRecord {
  additionalAnswers: Record<string, string>;
  email: string;
  fullName: string;
  phoneNumber: string;
}

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
