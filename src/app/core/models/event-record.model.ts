import { BillingRecord } from './billing-record.model';

export interface PartialEventRecord extends BillingRecord {
  eventId: string;
  orderId: string;
  paymentId: string;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: unknown;
  id: string;
  updatedAt: unknown;
  validated: boolean;
}
