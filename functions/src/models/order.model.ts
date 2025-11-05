export interface Order {
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  gatewayOrderId: string;
  paymentUrl: string;
}
