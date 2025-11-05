export interface GatewayToken {
  code: number;
  message: string;
  data: {
    token: string;
  };
}
