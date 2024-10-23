import { WolipayResponse } from './wolipay-response.model';

export interface WolipayToken extends WolipayResponse<{ token: string }> {}
