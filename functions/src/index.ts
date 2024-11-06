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
import {
  decrementSessionCount,
  getSessionById,
  incrementSessionCount,
} from './utils/sessions.utils';
import {
  addSessionRecord,
  deleteSessionRecord,
  getFirstSessionRecord,
  getUserSessionRecordsCount,
} from './utils/session-records.utils';
import {
  PartialSessionRecord,
  SessionRecord,
} from './models/session-record.model';

initializeApp();

const secrets = [
  'WOLIPAY_BASE_PATH',
  'WOLIPAY_EMAIL',
  'WOLIPAY_PASSWORD',
  'WOLIPAY_EVENT_NOTIFY_URL',
  'WOLIPAY_PRODUCT_NOTIFY_URL',
];

export const createSessionOrder = onCall(
  async (request: CallableRequest<any>) => {
    const auth = getAuth(request);

    const { sessionId } = request.data;

    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Faltan campos requeridos.');
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      throw new HttpsError('internal', 'El taller no existe.');
    }

    const { count, limit, name: sessionName } = session;

    if (count >= limit) {
      throw new HttpsError('resource-exhausted', 'El taller está llena.');
    }

    const email = auth.token.email!;
    const eventRecord = await getFirstEventRecord(session.eventId, email);

    if (!eventRecord || !eventRecord.validated) {
      throw new HttpsError(
        'internal',
        'Primero debes estar registrado al evento.',
      );
    }

    const existingRecord = await getFirstSessionRecord(sessionId, email);

    if (existingRecord && (existingRecord as SessionRecord).id) {
      throw new HttpsError(
        'already-exists',
        'Ya estás registrado en este taller.',
      );
    }

    for (const collapsedSessionId of session.overlapsWith) {
      const collapsedSessionRecord = await getFirstSessionRecord(
        collapsedSessionId,
        email,
      );

      if (
        collapsedSessionRecord &&
        (collapsedSessionRecord as SessionRecord).id
      ) {
        throw new HttpsError(
          'already-exists',
          'Ya estás registrado en un taller que se superpone con este taller.',
        );
      }
    }

    const { eventId, fullName, phoneNumber, searchTerm } = eventRecord;

    const event = await getEventById(eventId);

    if (!event) {
      throw new HttpsError('internal', 'El evento no existe.');
    }

    const maxSessionsPerUser = event.maxSessionsPerUser;
    const userSessionRecordsCount = await getUserSessionRecordsCount(
      eventId,
      email,
    );

    if (userSessionRecordsCount === null) {
      throw new HttpsError(
        'internal',
        'Error al obtener el conteo de registros a talleres del usuario.',
      );
    }

    if (userSessionRecordsCount >= maxSessionsPerUser) {
      throw new HttpsError(
        'resource-exhausted',
        'Ya te encuentras registrado en el máximo de talleres permitidos.',
      );
    }

    const sessionRecord: PartialSessionRecord = {
      email,
      eventId,
      fullName,
      phoneNumber,
      sessionId,
      sessionName,
      searchTerm,
    };

    const addedRecord = await addSessionRecord(sessionRecord);

    if (!addedRecord) {
      throw new HttpsError('internal', 'Error al crear la orden.');
    }

    await incrementSessionCount(sessionId);

    return addedRecord;
  },
);

export const deleteSessionOrder = onCall(
  async (request: CallableRequest<any>) => {
    const auth = getAuth(request);

    const { sessionId } = request.data;

    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'Faltan campos requeridos.');
    }

    const email = auth.token.email!;
    const existingRecord = await getFirstSessionRecord(sessionId, email);

    if (!existingRecord || !(existingRecord as SessionRecord).id) {
      throw new HttpsError(
        'not-found',
        'No te encuentras registrado en este taller.',
      );
    }

    const deleteResult = await deleteSessionRecord(sessionId, email);

    if (!deleteResult) {
      throw new HttpsError('internal', 'Error al eliminar el registro.');
    }

    await decrementSessionCount(sessionId);

    return existingRecord;
  },
);

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
      throw new HttpsError('internal', 'El evento no existe.');
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
      throw new HttpsError(
        'internal',
        'Error al generar los datos de facturación.',
      );
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
      throw new HttpsError('internal', 'Error al crear la orden.');
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
      throw new HttpsError('internal', 'El producto no existe.');
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
      throw new HttpsError(
        'internal',
        'Error al generar los datos de facturación.',
      );
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
      throw new HttpsError('internal', 'Error al crear la orden.');
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
      response.status(400).send('Faltan campos requeridos.');
      return;
    }

    const eventRecord = await getEventRecordByOrderId(orderId);

    if (!eventRecord) {
      response.status(404).send('Registro al evento no encontrado.');
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
        response.status(404).send('No se encontró el pago.');
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
      response.status(500).send('Error al actualizar el registro al evento.');
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
      response.status(400).send('Faltan campos requeridos.');
      return;
    }

    const productRecord = await getProductRecordByOrderId(orderId);

    if (!productRecord) {
      response.status(404).send('No se encontró el registro al evento.');
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
        response.status(404).send('No se encontró el pago.');
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
      response.status(500).send('Error al actualizar el registro al evento.');
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
    throw new HttpsError('unauthenticated', 'Debes estar autenticado.');
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
    throw new HttpsError('internal', 'Faltan variables de entorno requeridas.');
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
    throw new HttpsError('invalid-argument', 'Faltan campos requeridos.');
  }

  if (requireProductId && !productId) {
    throw new HttpsError('invalid-argument', 'Faltan campos requeridos.');
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
        'Ya estás registrado en este evento.',
      );
    } else if (existingRecord.paymentId === existingRecord.orderId) {
      throw new HttpsError(
        'already-exists',
        'Ya estás registrado en este evento gratuito.',
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
          'Ya pagaste por el registro a este evento.',
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
      throw new HttpsError('already-exists', 'Ya adquiriste este producto.');
    } else if (existingRecord.paymentId === existingRecord.orderId) {
      throw new HttpsError(
        'already-exists',
        'Ya adquiriste este producto gratuito.',
      );
    } else {
      const existingPayment = await getPaymentById(
        existingRecord.paymentId,
        wolipayEmail,
        wolipayPassword,
        wolipayBasePath,
      );

      if (existingPayment && existingPayment.payment.status === 'success') {
        throw new HttpsError('already-exists', 'Ya pagaste por este producto.');
      }
    }
  }

  return existingRecord;
}
