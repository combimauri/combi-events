import { getFirestore } from 'firebase-admin/firestore';
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
