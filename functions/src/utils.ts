import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import {
  AppEvent,
  Coupon,
  EventRecord,
  PartialEventRecord,
  WolipayToken,
  Price,
  BillingData,
  WolipayIFrame,
} from './models';

export async function getEvent(id: string): Promise<AppEvent | null> {
  try {
    const firestore = getFirestore();
    const eventDoc = firestore.collection('events').doc(id);
    const eventSnapshot = await eventDoc.get();

    return eventSnapshot.exists ? (eventSnapshot.data() as AppEvent) : null;
  } catch {
    logger.error('Failed to get event.');
    return null;
  }
}

export async function getCoupon(
  couponId: string | null,
  eventId: string,
): Promise<Coupon | null> {
  if (!couponId) {
    logger.info('No coupon provided.');
    return null;
  }

  try {
    const firestore = getFirestore();
    const couponsRef = firestore.collection('coupons');
    const querySnapshot = await couponsRef
      .where('id', '==', couponId)
      .where('eventId', '==', eventId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      logger.error('Coupon not found.');
      return null;
    }

    const coupon = querySnapshot.docs[0].data() as Coupon;

    if (coupon.count < coupon.limit) {
      return coupon;
    }

    logger.error('Coupon limit reached.');
    return null;
  } catch {
    logger.error('Failed to get coupon.');
    return null;
  }
}

export async function getFirstEventRecord(
  eventId: string,
  email: string,
): Promise<EventRecord | null> {
  try {
    const firestore = getFirestore();
    const eventRecordsRef = firestore.collection('event-records');
    const querySnapshot = await eventRecordsRef
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as EventRecord)
      : null;
  } catch {
    logger.info('Failed to get existing event record.');
    return null;
  }
}

export async function updateEventRecord(
  eventRecord: PartialEventRecord,
  existingRecord: EventRecord,
): Promise<EventRecord | null> {
  const data = {
    ...existingRecord,
    ...eventRecord,
    updatedAt: Timestamp.now(),
  };

  return upsertEventRecord(data);
}

export async function addEventRecord(
  eventRecord: PartialEventRecord,
): Promise<EventRecord | null> {
  const data = {
    ...eventRecord,
    createdAt: Timestamp.now(),
    id: crypto.randomUUID(),
    updatedAt: Timestamp.now(),
    validated: false,
  };

  return upsertEventRecord(data);
}

async function upsertEventRecord(eventRecord: EventRecord) {
  try {
    const firestore = getFirestore();
    const recordRef = firestore.collection('event-records').doc(eventRecord.id);

    await recordRef.set(eventRecord, { merge: false });

    const newRecord = await recordRef.get();

    return newRecord.exists ? (newRecord.data() as EventRecord) : null;
  } catch {
    logger.error('Failed to add event record.');
    return null;
  }
}

export async function getWolipayiFrame(
  email: string,
  fullName: string,
  phoneNumber: string,
  title: string,
  { description, amount, currency, discount }: Price,
  coupon: Coupon | null,
  wolipayEmail: string,
  wolipayPassword: string,
  wolipayBasePath: string,
  wolipayNotifyUrl: string,
): Promise<BillingData | null> {
  try {
    const id = crypto.randomUUID();
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
          id,
          title,
          description: description,
          notifyUrl: wolipayNotifyUrl,
          payment: {
            amount: amount,
            currency: currency,
            totalAmount: amount - totalDiscount,
            discount: {
              amount: totalDiscount,
              type: 'amount',
            },
          },
          billing: {
            firstName,
            lastName,
            email,
            phoneNumber,
          },
        }),
      });

      data = await response.json();
    }

    const url = data?.body.iFrameUrl || '';
    const paymentId = id;
    const lastSlashIndex = url.lastIndexOf('/');
    const orderId = url.substring(lastSlashIndex + 1);

    return {
      url,
      orderId,
      paymentId,
    };
  } catch (error) {
    logger.error('Failed to get Billing Data.');
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
  } catch {
    logger.error('Failed to generate token.');
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
