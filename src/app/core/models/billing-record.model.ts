export interface BillingRecord {
  fullName: string;
  email: string;
  phoneNumber: string;
  additionalAnswers: Record<string, string>;
}

export interface BillingData {
  url: string;
  orderId: string;
  paymentId: string;
}
