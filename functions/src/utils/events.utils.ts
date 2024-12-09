import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { AppEvent } from '../models/app-event.model';

export async function getEventById(id: string): Promise<AppEvent | null> {
  try {
    const firestore = getFirestore();
    const eventDoc = firestore.collection('events').doc(id);
    const eventSnapshot = await eventDoc.get();

    return eventSnapshot.exists ? (eventSnapshot.data() as AppEvent) : null;
  } catch (error) {
    logger.error('Failed to get event.', error);
    return null;
  }
}

export async function incrementEventCount(
  eventId: string,
): Promise<AppEvent | null> {
  try {
    const firestore = getFirestore();
    const eventRef = firestore.collection('events').doc(eventId);

    // Increment the count property by one
    await eventRef.update({
      count: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });

    const updatedEvent = await eventRef.get();

    return updatedEvent.exists ? (updatedEvent.data() as AppEvent) : null;
  } catch (error) {
    logger.error('Failed to increment event count.', error);
    return null;
  }
}
