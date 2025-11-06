import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { EventRecord, PartialEventRecord } from '../models/event-record.model';
import { getGatewayOrderByExternalId } from './biyuyo.utils';
import { getOrderById, upsertOrder } from './order.utils';
import { getEventById, incrementEventCount } from './events.utils';
import { incrementCouponCount } from './coupons.utils';
import { sendEventRegistrationEmail } from './mail.utils';

export async function getExistingEventRecord(
  email: string,
  eventId: string,
  gatewayEmail?: string,
  gatewayPassword?: string,
  gatewayBasePath?: string,
): Promise<EventRecord | null> {
  const existingRecord = await getFirstEventRecord(eventId, email);

  if (existingRecord) {
    if (existingRecord.validated) {
      throw new HttpsError(
        'already-exists',
        'Ya estás registrado en este evento.',
      );
    } else if (!existingRecord.orderId) {
      throw new HttpsError(
        'already-exists',
        'Ya estás registrado en este evento gratuito.',
      );
    } else if (gatewayEmail && gatewayPassword && gatewayBasePath) {
      const existingPayment = await getGatewayOrderByExternalId(
        existingRecord.orderId,
        gatewayEmail,
        gatewayPassword,
        gatewayBasePath,
      );

      if (existingPayment && existingPayment.data.payment.status === 'paid') {
        await validateRecordPayment(existingRecord);
        throw new HttpsError(
          'already-exists',
          'Tu pago ya estás registrado en este evento.',
        );
      }
    }
  }

  return existingRecord;
}

export async function getEventRecordById(id: string): Promise<EventRecord> {
  try {
    const firestore = getFirestore();
    const eventRecordDoc = firestore.collection('event-records').doc(id);
    const eventRecordSnapshot = await eventRecordDoc.get();

    const eventRecord = eventRecordSnapshot.exists
      ? (eventRecordSnapshot.data() as EventRecord)
      : null;
    if (!eventRecord) {
      throw new HttpsError('internal', 'El registro no existe.');
    }
    return eventRecord;
  } catch (error) {
    logger.error('Failed to get order.', error);
    throw new HttpsError('internal', 'Error al obtener el registro.');
  }
}

export async function getEventRecordByOrderId(
  orderId: string,
): Promise<EventRecord | null> {
  try {
    const firestore = getFirestore();
    const eventRecordsRef = firestore.collection('event-records');
    const querySnapshot = await eventRecordsRef
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as EventRecord)
      : null;
  } catch (error) {
    logger.info('Failed to get existing event record.', error);
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
  } catch (error) {
    logger.info('Failed to get existing event record.', error);
    return null;
  }
}

export async function updateEventRecord(
  eventRecord: Partial<EventRecord>,
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
  };

  return upsertEventRecord(data);
}

async function validateRecordPayment(existingRecord: EventRecord) {
  if (!existingRecord.orderId) {
    return;
  }

  const order = await getOrderById(existingRecord.orderId);
  await upsertOrder({ ...order, status: 'paid' });

  const updatedEventRecord = await updateEventRecord(
    { validated: true },
    existingRecord,
  );

  if (!updatedEventRecord) {
    throw new HttpsError(
      'internal',
      'Error al actualizar el registro al evento.',
    );
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
}

async function upsertEventRecord(
  eventRecord: EventRecord,
): Promise<EventRecord | null> {
  try {
    const firestore = getFirestore();
    const recordRef = firestore.collection('event-records').doc(eventRecord.id);

    await recordRef.set(eventRecord, { merge: false });

    const record = await recordRef.get();

    if (record.exists) {
      return record.data() as EventRecord;
    }

    logger.error('Failed to add event record.');
    throw new HttpsError('internal', 'Error al registrar el registro.');
  } catch (error) {
    logger.error('Failed to add event record.', error);
    throw new HttpsError('internal', 'Error al registrar el registro.');
  }
}
