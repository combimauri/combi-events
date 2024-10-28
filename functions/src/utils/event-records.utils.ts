import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { EventRecord, PartialEventRecord } from '../models/event-record.model';

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

async function upsertEventRecord(
  eventRecord: EventRecord,
): Promise<EventRecord | null> {
  try {
    const firestore = getFirestore();
    const recordRef = firestore.collection('event-records').doc(eventRecord.id);

    await recordRef.set(eventRecord, { merge: false });

    const record = await recordRef.get();

    return record.exists ? (record.data() as EventRecord) : null;
  } catch (error) {
    logger.error('Failed to add event record.', error);
    return null;
  }
}
