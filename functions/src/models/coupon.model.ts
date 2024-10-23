import { Timestamp } from 'firebase-admin/firestore';

export type Coupon = {
  count: number;
  createdAt: Timestamp;
  eventId: string;
  id: string;
  isActive: boolean;
  limit: number;
  updatedAt: Timestamp;
  value: number;
};
