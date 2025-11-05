import { logger } from 'firebase-functions/v2';
import { Coupon } from '../models/coupon.model';
import { Price } from '../models/price.model';
import { GatewayOrder } from '../models/gateway-order.model';
import { HttpsError } from 'firebase-functions/https';
import { GatewayToken } from '../models/gateway-token.model';
import { Order } from '../models/order.model';
import { getOrderById } from './order.utils';
import { GatewayUrl } from '../models/gateway-url.model';

export async function getOrderData(
  orderId: string | undefined,
  email: string,
  title: string,
  { description, amount, currency, discount }: Price,
  coupon: Coupon | null,
  gatewayEmail: string,
  gatewayPassword: string,
  gatewayBasePath: string,
): Promise<Order | null> {
  try {
    const totalDiscount = calculateDiscount(
      amount,
      discount,
      coupon?.value || 0,
    );
    const totalAmount = amount - totalDiscount;

    if (totalAmount <= 0) {
      return null;
    }

    if (orderId) {
      const order = await getOrderById(orderId);

      if (order.totalAmount === totalAmount) {
        return order;
      } else {
        // TODO: Delete existing order
      }
    }

    orderId = crypto.randomUUID();
    const data = await getPaymentUrl(
      gatewayEmail,
      gatewayPassword,
      gatewayBasePath,
      orderId,
      title,
      description,
      amount,
      currency,
      totalDiscount,
    );
    const paymentUrl = data.data.paymentUrl;
    const lastSlashIndex = paymentUrl.lastIndexOf('/');
    const gatewayOrderId = paymentUrl.substring(lastSlashIndex + 1);

    return {
      id: orderId,
      email,
      totalAmount,
      status: 'pending',
      gatewayOrderId,
      paymentUrl,
    };
  } catch (error) {
    logger.error('Failed to get Billing Data.', error);
    throw new HttpsError(
      'internal',
      'Error al generar los datos de facturación.',
    );
  }
}

export async function getGatewayOrderByExternalId(
  orderId: string,
  gatewayEmail: string,
  gatewayPassword: string,
  gatewayBasePath: string,
): Promise<GatewayOrder> {
  const token = await generateToken(
    gatewayEmail,
    gatewayPassword,
    gatewayBasePath,
  );

  try {
    const url = `${gatewayBasePath}/getOrderByExternalId`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ external_id: orderId }),
    });
    const data: GatewayOrder = await response.json();

    if (data.code !== 200) {
      throw new HttpsError('internal', data.message);
    }

    return data;
  } catch (error) {
    logger.error('Failed to get payment.', error);
    throw new HttpsError(
      'internal',
      'Error al generar los datos de facturación.',
    );
  }
}

async function generateToken(
  email: string,
  password: string,
  gatewayBasePath: string,
): Promise<string> {
  try {
    const response = await fetch(`${gatewayBasePath}/generateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: GatewayToken = await response.json();

    if (data.code !== 200) {
      throw new HttpsError('internal', data.message);
    }

    return data.data.token;
  } catch (error) {
    logger.error('Failed to generate token.', error);
    throw new HttpsError(
      'internal',
      'Error al generar los datos de facturación.',
    );
  }
}

async function getPaymentUrl(
  gatewayEmail: string,
  gatewayPassword: string,
  gatewayBasePath: string,
  orderId: string,
  title: string,
  description: string,
  amount: number,
  currency: string,
  discount: number,
): Promise<GatewayUrl> {
  try {
    const token = await generateToken(
      gatewayEmail,
      gatewayPassword,
      gatewayBasePath,
    );

    const response = await fetch(`${gatewayBasePath}/getPaymentUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        external_id: orderId,
        title,
        description,
        payment: {
          amount,
          currency,
          discount,
          // TODO: Remove once credit card is allowed
          default_method: 'qr',
          // TODO: Use event end date
          expiration_date: '2025-12-31T23:59:59Z',
        },
      }),
    });

    const data: GatewayUrl = await response.json();

    if (data.code !== 200) {
      throw new HttpsError('internal', data.message);
    }

    return data;
  } catch (error) {
    logger.error('Failed to get payment url.', error);
    throw new HttpsError(
      'internal',
      'Error al generar los datos de facturación.',
    );
  }
}

function calculateDiscount(
  amount: number,
  discount: number,
  couponValue: number,
): number {
  let discountAmount = discount + couponValue;

  if (discountAmount > amount) {
    discountAmount = amount;
  }

  return discountAmount;
}
