import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { HttpsError } from 'firebase-functions/v2/https';
import { Order } from '../models/order.model';

export async function getOrderById(id: string): Promise<Order> {
  try {
    const firestore = getFirestore();
    const orderDoc = firestore.collection('orders').doc(id);
    const orderSnapshot = await orderDoc.get();

    const order = orderSnapshot.exists ? (orderSnapshot.data() as Order) : null;
    if (!order) {
      throw new HttpsError('internal', 'El pedido no existe.');
    }
    return order;
  } catch (error) {
    logger.error('Failed to get order.', error);
    throw new HttpsError('internal', 'Error al obtener el pedido.');
  }
}

export async function upsertOrder(order: Order) {
  try {
    const firestore = getFirestore();
    const orderRef = firestore.collection('orders').doc(order.id);

    await orderRef.set(order, { merge: false });

    const newOrder = await orderRef.get();

    if (newOrder.exists) {
      return newOrder.data() as Order;
    }

    logger.error('Failed to register order.');
    throw new HttpsError('internal', 'Error al registrar el pedido.');
  } catch (error) {
    logger.error('Failed to register order.', error);
    throw new HttpsError('internal', 'Error al registrar el pedido.');
  }
}
