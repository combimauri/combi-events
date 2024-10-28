import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { Product } from '../models/product.model';

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const firestore = getFirestore();
    const productDoc = firestore.collection('products').doc(id);
    const productSnapshot = await productDoc.get();

    return productSnapshot.exists ? (productSnapshot.data() as Product) : null;
  } catch (error) {
    logger.error('Failed to get product.', error);
    return null;
  }
}
