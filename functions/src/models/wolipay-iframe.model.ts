import { WolipayResponse } from './wolipay-response.model';

export interface WolipayIFrame
  extends WolipayResponse<{
    iFrameUrl: string;
  }> {}
