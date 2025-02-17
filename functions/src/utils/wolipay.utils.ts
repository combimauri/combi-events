import { logger } from 'firebase-functions/v2';
import { BillingData } from '../models/billing-data.model';
import { Coupon } from '../models/coupon.model';
import { Payment } from '../models/payment.model';
import { Price } from '../models/price.model';
import { WolipayIFrame } from '../models/wolipay-iframe.model';
import { WolipayPayment } from '../models/wolipay-payment.model';
import { WolipayToken } from '../models/wolipay-token.model';

export async function getWolipayIFrame(
  email: string,
  fullName: string,
  title: string,
  { description, amount, currency, discount }: Price,
  coupon: Coupon | null,
  wolipayEmail: string,
  wolipayPassword: string,
  wolipayBasePath: string,
  wolipayNotifyUrl: string,
): Promise<BillingData | null> {
  try {
    const externalId = crypto.randomUUID();
    const splitName = fullName.split(' ');
    const lastName = splitName.pop();
    const firstName = splitName.join(' ') || lastName;
    const totalDiscount = calculateDiscount(
      amount,
      discount,
      coupon?.value || 0,
    );
    let data: WolipayIFrame | null = null;

    if (amount - totalDiscount > 0) {
      const token = await generateToken(
        wolipayEmail,
        wolipayPassword,
        wolipayBasePath,
      );

      if (!token) {
        logger.error('Failed to get token.');
        return null;
      }

      const response = await fetch(`${wolipayBasePath}/getWolipayiFrame`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          externalId,
          title,
          description,
          notifyUrl: wolipayNotifyUrl,
          payment: {
            amount,
            currency,
            totalAmount: amount - totalDiscount,
            discount: {
              amount: totalDiscount,
              type: 'amount',
            },
          },
          client: {
            firstName,
            lastName,
            email,
          },
          billing: {
            shouldInvoice: false,
          },
        }),
      });

      data = await response.json();
    }

    const url = data?.body.iFrameUrl || '';
    const paymentId = externalId;
    const lastSlashIndex = url.lastIndexOf('/');
    // Extract orderId from the URL. If it's not present, use the generated ID.
    // If paymentId and orderId are the same, it's a free event.
    const orderId = url.substring(lastSlashIndex + 1) || externalId;

    return {
      url,
      orderId,
      paymentId,
    };
  } catch (error) {
    logger.error('Failed to get Billing Data.', error);
    return null;
  }
}

export async function getPaymentByExternalId(
  paymentId: string,
  wolipayEmail: string,
  wolipayPassword: string,
  wolipayBasePath: string,
): Promise<Payment | null> {
  const token = await generateToken(
    wolipayEmail,
    wolipayPassword,
    wolipayBasePath,
  );

  if (!token) {
    logger.error('Failed to get token.');
    return null;
  }

  try {
    const url = `${wolipayBasePath}/getPaymentByExternalId?externalId=${paymentId}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data: WolipayPayment = await response.json();

    return data.body.order;
  } catch (error) {
    logger.error('Failed to get payment.', error);
    return null;
  }
}

async function generateToken(
  email: string,
  password: string,
  wolipayBasePath: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${wolipayBasePath}/generateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: WolipayToken = await response.json();

    return data.body.token;
  } catch (error) {
    logger.error('Failed to generate token.', error);
    return null;
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
