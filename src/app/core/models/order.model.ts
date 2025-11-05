export interface Order {
  id: string;
  email: string;
  gatewayOrderId: string;
  paymentUrl: string;
  status: string;
  totalAmount: number;
}
