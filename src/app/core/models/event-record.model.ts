import { Timestamp } from '@angular/fire/firestore';
import { BillingRecord } from './billing-record.model';
import { RecordRole } from './record-role.enum';
import { PaymentReceipts } from './payment-receipts.model';

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
  additionalRegistries?: Record<string, Timestamp>;
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  validated: boolean;
  paymentReceipts?: PaymentReceipts[];
}
