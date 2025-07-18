import { Timestamp } from 'firebase-admin/firestore';

export interface PartialProductRecord {
  additionalAnswers: Record<string, string | string[]>;
  couponId?: string;
  label?: string;
  email: string;
  eventId: string;
  fullName: string;
  orderId?: string;
  paymentId?: string;
  productId: string;
  productName: string;
  searchTerm: string;
  validated: boolean;
}

export interface ProductRecord extends PartialProductRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  paymentReceipts?: {
    id: 'main' | string;
    links: string[];
  }[];
}
