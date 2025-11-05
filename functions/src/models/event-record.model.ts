import { Timestamp } from 'firebase-admin/firestore';
import { RecordRole } from './record-role.enum';

export interface PartialEventRecord {
  additionalAnswers: Record<string, string | string[]>;
  couponId?: string;
  email: string;
  eventId: string;
  fullName: string;
  role: RecordRole;
  searchTerm: string;
  validated: boolean;
  orderId?: string; // Available for paid events
  /**
   * @deprecated new Event Records should use paymentId
   */
  paymentId?: string;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
  paymentReceipts?: {
    id: 'main' | string;
    links: string[];
  }[];
}
