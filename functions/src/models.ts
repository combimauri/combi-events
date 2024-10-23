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
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  validated: boolean;
}

export type WolipayToken = {
  code: number;
  message: string;
  body: { token: string };
};

export type WolipayIFrame = {
  code: number;
  message: string;
  body: { iFrameUrl: string };
};

export type Price = {
  amount: number;
  discount: number;
  currency: string;
  description: string;
};

export type AppEvent = {
  name: string;
  price: Price;
};

export type BillingData = {
  orderId: string;
  paymentId: string;
  url: string;
};

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
