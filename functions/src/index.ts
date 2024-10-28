import { initializeApp } from 'firebase-admin/app';
import {
  CallableRequest,
  HttpsError,
  onCall,
  onRequest,
} from 'firebase-functions/v2/https';
import { EventRecord, PartialEventRecord } from './models/event-record.model';
import { RecordRole } from './models/record-role.enum';
import {
  getCouponByIdAndEventId,
  getCouponByIdAndProductId,
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
import { AuthData } from 'firebase-functions/tasks';
import {
  addProductRecord,
  getFirstProductRecord,
  getProductRecordByOrderId,
  updateProductRecord,
} from './utils/product-records.utils';
import {
  PartialProductRecord,
  ProductRecord,
} from './models/product-record.model';
import { getProductById } from './utils/products.utils';

initializeApp();

const secrets = [
  'WOLIPAY_BASE_PATH',
  'WOLIPAY_EMAIL',
  'WOLIPAY_PASSWORD',
  'WOLIPAY_EVENT_NOTIFY_URL',
  'WOLIPAY_PRODUCT_NOTIFY_URL',
];

export const createEventOrder = onCall(
  { secrets },
  async (request: CallableRequest<any>) => {
    const auth = getAuth(request);
    const {
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
      wolipayEventNotifyUrl,
    } = getEnvironmentVariables();
    const { eventId, fullName, phoneNumber, additionalAnswers, couponId } =
      getRequestOrderData(request);
    const event = await getEventById(eventId);

    if (!event) {
      throw new HttpsError('internal', 'Event does not exist.');
    }

    const email = auth.token.email!;
    const existingRecord = await getExistingEventRecord(
      email,
      eventId,
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
    );

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
      wolipayEventNotifyUrl,
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
      role: RecordRole.Attendee,
      searchTerm: fullName.replace(/\s/g, '').toLowerCase(),
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

      if (coupon.recordLabel) {
        eventRecord.role = coupon.recordLabel;
      }
    } else {
      delete existingRecord?.couponId;
    }

    const upsertedRecord = existingRecord
      ? await updateEventRecord(eventRecord, existingRecord)
      : await addEventRecord(eventRecord);

    if (!upsertedRecord) {
      throw new HttpsError('internal', 'Failed to create order.');
    }

    const { id: recordId, couponId: usedCouponId, validated } = upsertedRecord;

    if (usedCouponId && validated) {
      await incrementCouponCount(usedCouponId);
    }

    return {
      recordId,
      orderId,
      paymentId,
      url,
    };
  },
);

export const createProductOrder = onCall(
  { secrets },
  async (request: CallableRequest<any>) => {
    const auth = getAuth(request);
    const {
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
      wolipayProductNotifyUrl,
    } = getEnvironmentVariables();
    const {
      eventId,
      fullName,
      phoneNumber,
      additionalAnswers,
      productId,
      couponId,
    } = getRequestOrderData(request, true);
    const product = await getProductById(productId);

    if (!product) {
      throw new HttpsError('internal', 'Product does not exist.');
    }

    const email = auth.token.email!;
    const existingRecord = await getExistingProductRecord(
      email,
      productId,
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
    );

    const coupon = await getCouponByIdAndProductId(couponId, productId);
    const billingData = await getWolipayIFrame(
      email,
      fullName,
      phoneNumber,
      product.name,
      product.price,
      coupon,
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
      wolipayProductNotifyUrl,
    );

    if (!billingData) {
      throw new HttpsError('internal', 'Failed to generate billing data.');
    }

    const { orderId, paymentId, url } = billingData;
    // If paymentId and orderId are the same, it's a free product.
    const freeProduct = orderId === paymentId;
    const productRecord: PartialProductRecord = {
      additionalAnswers,
      email,
      eventId,
      productId,
      productName: product.name,
      fullName,
      orderId,
      paymentId,
      phoneNumber,
      searchTerm: fullName.replace(/\s/g, '').toLowerCase(),
      validated: false,
    };

    if (freeProduct) {
      productRecord.validated = true;

      await upsertPayment({
        id: paymentId,
        orderId,
        billing: { email },
        payment: { totalAmount: 0, status: 'success' },
      });
    }

    if (coupon) {
      productRecord.couponId = coupon.id;

      if (coupon.recordLabel) {
        productRecord.label = coupon.recordLabel;
      }
    } else {
      delete existingRecord?.couponId;
    }

    const upsertedRecord = existingRecord
      ? await updateProductRecord(productRecord, existingRecord)
      : await addProductRecord(productRecord);

    if (!upsertedRecord) {
      throw new HttpsError('internal', 'Failed to create order.');
    }

    const { id: recordId, couponId: usedCouponId, validated } = upsertedRecord;

    if (usedCouponId && validated) {
      await incrementCouponCount(usedCouponId);
    }

    return {
      recordId,
      orderId,
      paymentId,
      url,
    };
  },
);

export const validateEventPayment = onRequest(
  { cors: true, secrets },
  async (request, response) => {
    const { wolipayEmail, wolipayPassword, wolipayBasePath } =
      getEnvironmentVariables();

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

export const validateProductPayment = onRequest(
  { cors: true, secrets },
  async (request, response) => {
    const { wolipayEmail, wolipayPassword, wolipayBasePath } =
      getEnvironmentVariables();

    const orderId = request.body.orderId || request.body.data.orderId;

    if (!orderId) {
      response.status(400).send('Missing required fields.');
      return;
    }

    const productRecord = await getProductRecordByOrderId(orderId);

    if (!productRecord) {
      response.status(404).send('Product record not found.');
      return;
    }

    const { paymentId } = productRecord;
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
        billing: { email: productRecord.email },
        payment: { totalAmount: 0, status },
      });
    }

    const updatedProductRecord = await updateProductRecord(
      { validated: status === 'success' },
      productRecord,
    );

    if (!updatedProductRecord) {
      response.status(500).send('Failed to update product record.');
      return;
    }

    const { couponId: usedCouponId, validated } = updatedProductRecord;

    if (usedCouponId && validated) {
      await incrementCouponCount(usedCouponId);
    }

    response.send({ data: { validated: updatedProductRecord.validated } });
  },
);

function getAuth(request: CallableRequest<any>): AuthData {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.',
    );
  }

  return request.auth;
}

function getEnvironmentVariables(): {
  wolipayEmail: string;
  wolipayPassword: string;
  wolipayBasePath: string;
  wolipayEventNotifyUrl: string;
  wolipayProductNotifyUrl: string;
} {
  const wolipayEmail = process.env.WOLIPAY_EMAIL;
  const wolipayPassword = process.env.WOLIPAY_PASSWORD;
  const wolipayBasePath = process.env.WOLIPAY_BASE_PATH;
  const wolipayEventNotifyUrl = process.env.WOLIPAY_EVENT_NOTIFY_URL;
  const wolipayProductNotifyUrl = process.env.WOLIPAY_PRODUCT_NOTIFY_URL;

  if (
    !wolipayEmail ||
    !wolipayPassword ||
    !wolipayBasePath ||
    !wolipayEventNotifyUrl ||
    !wolipayProductNotifyUrl
  ) {
    throw new HttpsError('internal', 'Missing required environment variables.');
  }

  return {
    wolipayEmail,
    wolipayPassword,
    wolipayBasePath,
    wolipayEventNotifyUrl,
    wolipayProductNotifyUrl,
  };
}

function getRequestOrderData(
  request: CallableRequest<any>,
  requireProductId = false,
): {
  eventId: string;
  fullName: string;
  phoneNumber: string;
  additionalAnswers: Record<string, string>;
  productId: string;
  couponId: string;
} {
  const {
    eventId,
    fullName,
    phoneNumber,
    additionalAnswers,
    productId,
    couponId,
  } = request.data;

  if (!eventId || !fullName || !phoneNumber || !additionalAnswers) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }

  if (requireProductId && !productId) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }

  return {
    eventId,
    fullName,
    phoneNumber,
    additionalAnswers,
    productId,
    couponId,
  };
}

async function getExistingEventRecord(
  email: string,
  eventId: string,
  wolipayEmail: string,
  wolipayPassword: string,
  wolipayBasePath: string,
): Promise<EventRecord | null> {
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

  return existingRecord;
}

async function getExistingProductRecord(
  email: string,
  productId: string,
  wolipayEmail: string,
  wolipayPassword: string,
  wolipayBasePath: string,
): Promise<ProductRecord | null> {
  const existingRecord = await getFirstProductRecord(productId, email);

  if (existingRecord) {
    if (existingRecord.validated) {
      throw new HttpsError(
        'already-exists',
        'You have already acquired this product.',
      );
    } else if (existingRecord.paymentId === existingRecord.orderId) {
      throw new HttpsError(
        'already-exists',
        'You have already acquired this free product.',
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
          'You have already paid for this product.',
        );
      }
    }
  }

  return existingRecord;
}
