export type Payment = {
  id: string;
  orderId?: string;
  billing: { email: string };
  payment: { totalAmount: number; status: string };
};
