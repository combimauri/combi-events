import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import {
  PartialSessionRecord,
  SessionRecord,
} from '../models/session-record.model';

export async function getFirstSessionRecord(
  sessionId: string,
  email: string,
): Promise<SessionRecord | {} | null> {
  try {
    const firestore = getFirestore();
    const sessionRecordsRef = firestore.collection('session-records');
    const querySnapshot = await sessionRecordsRef
      .where('sessionId', '==', sessionId)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as SessionRecord)
      : {};
  } catch (error) {
    logger.info('Failed to get existing session record.', error);
    return null;
  }
}

export async function getUserSessionRecordsCount(
  eventId: string,
  email: string,
): Promise<number | null> {
  try {
    const firestore = getFirestore();
    const sessionRecordsRef = firestore.collection('session-records');
    const querySnapshot = await sessionRecordsRef
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .get();

    return querySnapshot.size;
  } catch (error) {
    logger.info('Failed to get existing session records count.', error);
    return null;
  }
}

export async function deleteSessionRecord(
  sessionId: string,
  email: string,
): Promise<boolean> {
  try {
    const firestore = getFirestore();
    const sessionRecordsRef = firestore.collection('session-records');
    const querySnapshot = await sessionRecordsRef
      .where('sessionId', '==', sessionId)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      logger.info('No session record found to delete.');
      return false;
    }

    const docId = querySnapshot.docs[0].id;
    await sessionRecordsRef.doc(docId).delete();
    logger.info(`Session record with ID ${docId} deleted successfully.`);
    return true;
  } catch (error) {
    logger.error('Failed to delete session record.', error);
    return false;
  }
}

export async function addSessionRecord(
  sessionRecord: PartialSessionRecord,
): Promise<SessionRecord | null> {
  const data = {
    ...sessionRecord,
    createdAt: Timestamp.now(),
    id: crypto.randomUUID(),
    updatedAt: Timestamp.now(),
  };

  return upsertSessionRecord(data);
}

async function upsertSessionRecord(
  sessionRecord: SessionRecord,
): Promise<SessionRecord | null> {
  try {
    const firestore = getFirestore();
    const recordRef = firestore
      .collection('session-records')
      .doc(sessionRecord.id);

    await recordRef.set(sessionRecord, { merge: false });

    const record = await recordRef.get();

    return record.exists ? (record.data() as SessionRecord) : null;
  } catch (error) {
    logger.error('Failed to add session record.', error);
    return null;
  }
}
