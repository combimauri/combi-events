import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { Session } from '../models/session.model';

export async function getSessionById(id: string): Promise<Session | null> {
  try {
    const firestore = getFirestore();
    const sessionDoc = firestore.collection('sessions').doc(id);
    const sessionSnapshot = await sessionDoc.get();

    return sessionSnapshot.exists ? (sessionSnapshot.data() as Session) : null;
  } catch (error) {
    logger.error('Failed to get session.', error);
    return null;
  }
}

export async function incrementSessionCount(
  sessionId: string,
): Promise<Session | null> {
  try {
    const firestore = getFirestore();
    const sessionRef = firestore.collection('sessions').doc(sessionId);

    // Increment the count property by one
    await sessionRef.update({
      count: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });

    const updatedSession = await sessionRef.get();

    return updatedSession.exists ? (updatedSession.data() as Session) : null;
  } catch (error) {
    logger.error('Failed to increment session count.', error);
    return null;
  }
}

export async function decrementSessionCount(
  sessionId: string,
): Promise<Session | null> {
  try {
    const firestore = getFirestore();
    const sessionRef = firestore.collection('sessions').doc(sessionId);

    // Decrement the count property by one
    await sessionRef.update({
      count: FieldValue.increment(-1),
      updatedAt: Timestamp.now(),
    });

    const updatedSession = await sessionRef.get();

    return updatedSession.exists ? (updatedSession.data() as Session) : null;
  } catch (error) {
    logger.error('Failed to decrement session count.', error);
    return null;
  }
}
