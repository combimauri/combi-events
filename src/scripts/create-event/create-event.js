import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

import { keys } from './keys.js';
import { events } from './events.js';

const firebaseConfig = keys.firebase;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateAndInsertEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error('Events should be an array');
  }

  const eventsCol = collection(db, 'events');

  for (const event of events) {
    if (!event.id) {
      event.id = crypto.randomUUID();
    }

    const eventDoc = doc(eventsCol, event.id);
    await setDoc(eventDoc, event, { merge: true });
  }
}

validateAndInsertEvents(events)
  .then(() => console.log('Events have been successfully inserted/updated'))
  .catch((error) => console.error('Error inserting/updating events:', error));
