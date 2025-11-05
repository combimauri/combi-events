export interface GatewayUrl {
  code: number;
  message: string;
  data: {
    paymentUrl: string;
  };
}
