import { Timestamp } from '@angular/fire/firestore';
import { RecordRole } from './record-role.enum';

export interface Coupon {
  count: number;
  createdAt: Timestamp;
  eventId: string;
  id: string;
  isActive: boolean;
  limit: number;
  recordLabel?: RecordRole;
  updatedAt: Timestamp;
  value: number;
}
