import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions/v2';
import {
  CallableRequest,
  HttpsError,
  onCall,
  onRequest,
} from 'firebase-functions/v2/https';
import { getEventById, incrementEventCount } from './utils/events.utils';
import {
  getCouponByIdAndEventId,
  incrementCouponCount,
} from './utils/coupons.utils';
import { AuthData } from 'firebase-functions/tasks';
import {
  addEventRecord,
  getEventRecordById,
  getExistingEventRecord,
  updateEventRecord,
} from './utils/event-records.utils';
import {
  getGatewayOrderByExternalId,
  getOrderData,
} from './utils/biyuyo.utils';
import { PartialEventRecord } from './models/event-record.model';
import { RecordRole } from './models/record-role.enum';
import { getOrderById, upsertOrder } from './utils/order.utils';
import { sendEventRegistrationEmail } from './utils/mail.utils';

initializeApp();

const secrets = [
  'PAYMENT_GATEWAY_BASE_PATH',
  'PAYMENT_GATEWAY_EMAIL',
  'PAYMENT_GATEWAY_PASSWORD',
];

export const createNewEventOrder = onCall(
  { secrets },
  async (request: CallableRequest<any>) => {
    const auth = getAuth(request);
    const { gatewayBasePath, gatewayEmail, gatewayPassword } =
      getEnvironmentVariables();
    const { eventId, fullName, additionalAnswers, couponId } = request.data;
    const event = await getEventById(eventId);
    const coupon = await getCouponByIdAndEventId(couponId, eventId);
    const email = auth.token.email!;
    const existingEventRecord = await getExistingEventRecord(
      email,
      eventId,
      gatewayEmail,
      gatewayPassword,
      gatewayBasePath,
    );
    const orderData = await getOrderData(
      existingEventRecord?.orderId,
      email,
      event.name,
      event.price,
      coupon,
      gatewayEmail,
      gatewayPassword,
      gatewayBasePath,
    );
    const newEventRecordData: PartialEventRecord = {
      additionalAnswers,
      email,
      eventId,
      fullName,
      role: RecordRole.Attendee,
      searchTerm: fullName.replace(/\s/g, '').toLowerCase(),
      validated: false,
    };

    // Event is free
    if (!orderData) {
      newEventRecordData.validated = true;
    } else {
      await upsertOrder(orderData);
      newEventRecordData.orderId = orderData.id;
    }

    // Add coupon info
    if (coupon) {
      newEventRecordData.couponId = coupon.id;
      if (coupon.recordLabel) {
        newEventRecordData.role = coupon.recordLabel;
      }
    } else if (existingEventRecord) {
      delete existingEventRecord.couponId;
    }

    const upsertedRecord = existingEventRecord
      ? await updateEventRecord(newEventRecordData, existingEventRecord)
      : await addEventRecord(newEventRecordData);

    const { id: recordId, couponId: usedCouponId, validated } = upsertedRecord!;

    if (validated) {
      await incrementEventCount(eventId);

      if (usedCouponId) {
        await incrementCouponCount(usedCouponId);
      }

      getEventById(eventId)
        .then((event) => sendEventRegistrationEmail(event, upsertedRecord!))
        .catch((error) => logger.error(error));
    }

    return {
      recordId,
      orderData,
    };
  },
);

export const validateEventPayment = onRequest(
  { cors: true, secrets },
  async (request, response) => {
    const { gatewayBasePath, gatewayEmail, gatewayPassword } =
      getEnvironmentVariables();

    const { eventRecordId } = request.body.data;

    if (!eventRecordId) {
      response.status(400).send('Faltan campos requeridos.');
      return;
    }

    const eventRecord = await getEventRecordById(eventRecordId);
    let status = '';

    if (eventRecord.orderId) {
      const gatewayOrder = await getGatewayOrderByExternalId(
        eventRecord.orderId,
        gatewayEmail,
        gatewayPassword,
        gatewayBasePath,
      );
      const order = await getOrderById(eventRecord.orderId);

      status = gatewayOrder.data.payment.status;

      await upsertOrder({ ...order, status });
    } else {
      status = 'paid';
    }

    const updatedEventRecord = await updateEventRecord(
      { validated: status === 'paid' },
      eventRecord,
    );

    if (!updatedEventRecord) {
      response.status(500).send('Error al actualizar el registro al evento.');
      return;
    }

    const { eventId, couponId: usedCouponId, validated } = updatedEventRecord;

    if (validated) {
      await incrementEventCount(eventId);

      if (usedCouponId) {
        await incrementCouponCount(usedCouponId);
      }

      getEventById(eventId)
        .then((event) => sendEventRegistrationEmail(event, updatedEventRecord))
        .catch((error) => logger.error(error));
    }

    response.send({ data: { validated: updatedEventRecord.validated } });
  },
);

function getAuth(request: CallableRequest<any>): AuthData {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Debes estar autenticado.');
  }

  return request.auth;
}

function getEnvironmentVariables(): {
  gatewayEmail: string;
  gatewayPassword: string;
  gatewayBasePath: string;
} {
  const gatewayEmail = process.env.PAYMENT_GATEWAY_EMAIL;
  const gatewayPassword = process.env.PAYMENT_GATEWAY_PASSWORD;
  const gatewayBasePath = process.env.PAYMENT_GATEWAY_BASE_PATH;

  if (!gatewayEmail || !gatewayPassword || !gatewayBasePath) {
    throw new HttpsError('internal', 'Faltan variables de entorno requeridas.');
  }

  return {
    gatewayEmail: gatewayEmail,
    gatewayPassword: gatewayPassword,
    gatewayBasePath: gatewayBasePath,
  };
}
