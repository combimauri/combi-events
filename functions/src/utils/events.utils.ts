import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { AppEvent } from '../models/app-event.model';

export async function getEventById(id: string): Promise<AppEvent> {
  try {
    const firestore = getFirestore();
    const eventDoc = firestore.collection('events').doc(id);
    const eventSnapshot = await eventDoc.get();

    const event = eventSnapshot.exists ? (eventSnapshot.data() as AppEvent) : null;
    if (!event) {
      throw new HttpsError('internal', 'El evento no existe.');
    }
    if (!event.openRegistration || event.count >= event.capacity) {
      throw new HttpsError('resource-exhausted', 'El evento está lleno.');
    }
    return event;
  } catch (error) {
    logger.error('Failed to get event.', error);
    throw new HttpsError('internal', 'Error al obtener el evento.');
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
