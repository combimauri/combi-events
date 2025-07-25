export interface BillingRecord {
  additionalAnswers: Record<string, string | string[]>;
  couponId?: string;
  email: string;
  fullName: string;
}
