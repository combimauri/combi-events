export interface PartialEventRecord {
  email: string;
  eventId: string;
  firstName: string;
  lastName: string;
  orderId: string;
  phoneNumber: string;
  paymentId: string;
}

export interface EventRecord extends PartialEventRecord {
  createdAt: unknown;
  id: string;
  updatedAt: unknown;
  validated: boolean;
}
