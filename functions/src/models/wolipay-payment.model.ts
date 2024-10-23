import { Payment } from './payment.model';
import { WolipayResponse } from './wolipay-response.model';

export interface WolipayPayment extends WolipayResponse<{ order: Payment }> {}
