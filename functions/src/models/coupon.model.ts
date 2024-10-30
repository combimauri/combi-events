import { Timestamp } from 'firebase-admin/firestore';
import { RecordRole } from './record-role.enum';

export type Coupon = {
  count: number;
  createdAt: Timestamp;
  eventId?: string;
  id: string;
  isActive: boolean;
  limit: number;
  productId?: string;
  recordLabel?: RecordRole;
  updatedAt: Timestamp;
  value: number;
};
