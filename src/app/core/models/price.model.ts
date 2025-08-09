import { SimpleQR } from './simple-qr.model';

export interface Price {
  amount: number;
  discount: number;
  currency: string;
  description: string;
  discountCondition?: 'REGISTERED';
  qrs?: SimpleQR[];
}
