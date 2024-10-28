import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { Payment } from '../models/payment.model';

export async function upsertPayment(payment: Payment) {
  try {
    const firestore = getFirestore();
    const paymentRef = firestore.collection('payments').doc(payment.id);

    await paymentRef.set(payment, { merge: false });

    const newPayment = await paymentRef.get();

    return newPayment.exists ? (newPayment.data() as Payment) : null;
  } catch (error) {
    logger.error('Failed to register payment.', error);
    return false;
  }
}
