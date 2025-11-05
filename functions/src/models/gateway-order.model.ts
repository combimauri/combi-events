export interface GatewayOrder {
  code: number;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    created_at: number;
    payment: {
      amount: number;
      currency: string;
      default_method: 'methods' | 'qr' | 'card';
      total_amount: number;
      currency_exchange_rate: number;
      status: string;
      discount: number;
      expiration_date: number;
    };
  };
}
