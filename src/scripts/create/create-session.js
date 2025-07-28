import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

import { keys } from './keys.js';
import { sessions } from './sessions.js';

const firebaseConfig = keys.firebase;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateAndInsertSessions(sessions) {
  if (!Array.isArray(sessions)) {
    throw new Error('sessions should be an array');
  }

  const sessionsCol = collection(db, 'sessions');

  for (const product of sessions) {
    if (!product.id) {
      product.id = crypto.randomUUID();
    }

    const productDoc = doc(sessionsCol, product.id);
    await setDoc(productDoc, product, { merge: true });
  }
}

validateAndInsertSessions(sessions)
  .then(() => console.log('Sessions have been successfully inserted/updated'))
  .catch((error) => console.error('Error inserting/updating sessions:', error));
