import { Timestamp } from 'firebase-admin/firestore';
import { RecordRole } from './record-role.enum';

export interface PartialEventRecord {
  additionalAnswers: Record<string, string>;
  couponId?: string;
  email: string;
  eventId: string;
  fullName: string;
  orderId?: string;
  paymentId?: string;
  role: RecordRole;
  searchTerm: string;
  validated: boolean;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
}
