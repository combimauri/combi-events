import { initializeApp } from 'firebase-admin/app';
import {
  CallableRequest,
  HttpsError,
  onCall,
  onRequest,
} from 'firebase-functions/v2/https';
import { PartialEventRecord } from './models/event-record.model';
import {
  getCouponByIdAndEventId,
  incrementCouponCount,
} from './utils/coupons.utils';
import { getEventById } from './utils/events.utils';
import {
  addEventRecord,
  getEventRecordByOrderId,
  getFirstEventRecord,
  updateEventRecord,
} from './utils/event-records.utils';
import { upsertPayment } from './utils/payments.utils';
import { getWolipayIFrame, getPaymentById } from './utils/wolipay.utils';

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

    const event = await getEventById(eventId);

    if (!event) {
      throw new HttpsError('internal', 'Event does not exist.');
    }

    const email = request.auth.token.email!;
    const existingRecord = await getFirstEventRecord(eventId, email);

    if (existingRecord) {
      if (existingRecord.validated) {
        throw new HttpsError(
          'already-exists',
          'You have already registered for this event.',
        );
      } else if (existingRecord.paymentId === existingRecord.orderId) {
        throw new HttpsError(
          'already-exists',
          'You have already registered for this free event.',
        );
      } else {
        const existingPayment = await getPaymentById(
          existingRecord.paymentId,
          wolipayEmail,
          wolipayPassword,
          wolipayBasePath,
        );

        if (existingPayment && existingPayment.payment.status === 'success') {
          throw new HttpsError(
            'already-exists',
            'You have already paid for this event.',
          );
        }
      }
    }

    const coupon = await getCouponByIdAndEventId(couponId, eventId);
    const billingData = await getWolipayIFrame(
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
    // If paymentId and orderId are the same, it's a free event.
    const freeEvent = orderId === paymentId;
    const eventRecord: PartialEventRecord = {
      additionalAnswers,
      email,
      eventId,
      fullName,
      orderId,
      paymentId,
      phoneNumber,
      validated: false,
    };

    if (freeEvent) {
      eventRecord.validated = true;

      await upsertPayment({
        id: paymentId,
        orderId,
        billing: { email },
        payment: { totalAmount: 0, status: 'success' },
      });
    }

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

    const {
      id: eventRecordId,
      couponId: usedCouponId,
      validated,
    } = upsertedRecord;

    if (usedCouponId && validated) {
      await incrementCouponCount(usedCouponId);
    }

    return {
      eventRecordId,
      orderId,
      paymentId,
      url,
    };
  },
);

export const validatePayment = onRequest(
  {
    cors: true,
    secrets: ['WOLIPAY_BASE_PATH', 'WOLIPAY_EMAIL', 'WOLIPAY_PASSWORD'],
  },
  async (request, response) => {
    const wolipayEmail = process.env.WOLIPAY_EMAIL;
    const wolipayPassword = process.env.WOLIPAY_PASSWORD;
    const wolipayBasePath = process.env.WOLIPAY_BASE_PATH;

    if (!wolipayEmail || !wolipayPassword || !wolipayBasePath) {
      response.status(500).send('Missing required environment variables.');
      return;
    }

    const orderId = request.body.orderId || request.body.data.orderId;

    if (!orderId) {
      response.status(400).send('Missing required fields.');
      return;
    }

    const eventRecord = await getEventRecordByOrderId(orderId);

    if (!eventRecord) {
      response.status(404).send('Event record not found.');
      return;
    }

    const { paymentId } = eventRecord;
    let status = '';

    if (orderId !== paymentId) {
      const payment = await getPaymentById(
        paymentId,
        wolipayEmail,
        wolipayPassword,
        wolipayBasePath,
      );

      if (!payment) {
        response.status(404).send('Payment not found.');
        return;
      }

      status = payment.payment.status;

      await upsertPayment({ ...payment, orderId });
    } else {
      status = 'success';

      await upsertPayment({
        id: paymentId,
        orderId,
        billing: { email: eventRecord.email },
        payment: { totalAmount: 0, status },
      });
    }

    const updatedEventRecord = await updateEventRecord(
      { validated: status === 'success' },
      eventRecord,
    );

    if (!updatedEventRecord) {
      response.status(500).send('Failed to update event record.');
      return;
    }

    const { couponId: usedCouponId, validated } = updatedEventRecord;

    if (usedCouponId && validated) {
      await incrementCouponCount(usedCouponId);
    }

    response.send({ data: { validated: updatedEventRecord.validated } });
  },
);
