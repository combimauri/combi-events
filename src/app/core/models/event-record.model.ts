import { Timestamp } from '@angular/fire/firestore';
import { BillingRecord } from './billing-record.model';
import { RecordRole } from './record-role.enum';

export interface PartialEventRecord extends BillingRecord {
  eventId: string;
  notes?: string;
  orderId: string;
  paymentId: string;
  registeredAt?: Timestamp;
  role: RecordRole;
  searchTerm: string;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  validated: boolean;
}
