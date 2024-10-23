import { Timestamp } from '@angular/fire/firestore';

export interface Coupon {
  count: number;
  createdAt: Timestamp;
  eventId: string;
  id: string;
  isActive: boolean;
  limit: number;
  updatedAt: Timestamp;
  value: number;
}
