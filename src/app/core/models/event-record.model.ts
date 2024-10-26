import { Timestamp } from '@angular/fire/firestore';
import { RecordRole } from './record-role.enum';

export interface BillingRecord {
  additionalAnswers: Record<string, string>;
  couponId?: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface PartialEventRecord extends BillingRecord {
  eventId: string;
  notes?: string;
  orderId: string;
  paymentId: string;
  role: RecordRole;
  searchTerm: string;
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
