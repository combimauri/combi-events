import { Timestamp } from 'firebase-admin/firestore';

export interface PartialEventRecord {
  additionalAnswers: Record<string, string>;
  couponId?: string;
  email: string;
  eventId: string;
  fullName: string;
  orderId: string;
  paymentId: string;
  phoneNumber: string;
  validated: boolean;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
}
