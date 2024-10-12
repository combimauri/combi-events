import { WolipayResponse } from './wolipay-response.model';

export interface WolipayPayment
  extends WolipayResponse<{ order: { payment: { status: string } } }> {}
