import { initializeApp } from 'firebase-admin/app';
import {
  onCall,
  CallableRequest,
  HttpsError,
} from 'firebase-functions/v2/https';
import { PartialEventRecord } from './models';
import {
  addEventRecord,
  getCoupon,
  getEvent,
  getFirstEventRecord,
  getWolipayiFrame,
  updateEventRecord,
} from './utils';

initializeApp();

export const createOrder = onCall(
  {
    secrets: [
      'WOLIPAY_BASE_PATH',
      'WOLIPAY_EMAIL',
      'WOLIPAY_NOTIFY_URL',
      'WOLIPAY_PASSWORD',
    ],
  },
  async (request: CallableRequest<any>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }

    const wolipayEmail = process.env.WOLIPAY_EMAIL;
    const wolipayPassword = process.env.WOLIPAY_PASSWORD;
    const wolipayBasePath = process.env.WOLIPAY_BASE_PATH;
    const wolipayNotifyUrl = process.env.WOLIPAY_NOTIFY_URL;

    if (
      !wolipayEmail ||
      !wolipayPassword ||
      !wolipayBasePath ||
      !wolipayNotifyUrl
    ) {
      throw new HttpsError(
        'internal',
        'Missing required environment variables.',
      );
    }

    const { eventId, fullName, phoneNumber, additionalAnswers, couponId } =
      request.data;

    if (!eventId || !fullName || !phoneNumber || !additionalAnswers) {
      throw new HttpsError('internal', 'Missing required fields.');
    }

    const event = await getEvent(eventId);

    if (!event) {
      throw new HttpsError('internal', 'Event does not exist.');
    }

    const coupon = await getCoupon(couponId, eventId);
    const email = request.auth.token.email!;
    const billingData = await getWolipayiFrame(
      email,
      fullName,
      phoneNumber,
      event.name,
      event.price,
      coupon,
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
      wolipayNotifyUrl,
    );

    if (!billingData) {
      throw new HttpsError('internal', 'Failed to generate billing data.');
    }

    const { orderId, paymentId, url } = billingData;
    const eventRecord: PartialEventRecord = {
      additionalAnswers,
      email,
      eventId,
      fullName,
      orderId,
      paymentId,
      phoneNumber,
    };
    const existingRecord = await getFirstEventRecord(eventId, email);

    if (coupon) {
      eventRecord.couponId = coupon.id;
    } else {
      delete existingRecord?.couponId;
    }

    const upsertedRecord = existingRecord
      ? await updateEventRecord(eventRecord, existingRecord)
      : await addEventRecord(eventRecord);

    if (!upsertedRecord) {
      throw new HttpsError('internal', 'Failed to create order.');
    }

    const { id: eventRecordId } = upsertedRecord;

    return {
      eventRecordId,
      orderId,
      paymentId,
      url,
    };
  },
);

export const validatePayment = onCall(
  {
    secrets: ['WOLIPAY_NOTIFY_URL'],
  },
  async (request: CallableRequest<any>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }

    const wolipayNotifyUrl = process.env.WOLIPAY_NOTIFY_URL;

    if (!wolipayNotifyUrl) {
      throw new HttpsError(
        'internal',
        'Missing required environment variables.',
      );
    }

    const { orderId } = request.data;

    if (!orderId) {
      throw new HttpsError('internal', 'Missing required fields.');
    }

    try {
      return await fetch(wolipayNotifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
        }),
      });
    } catch {
      throw new HttpsError('internal', 'Failed to validate payment.');
    }
  },
);
