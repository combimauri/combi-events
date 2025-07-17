import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import {
  PartialProductRecord,
  ProductRecord,
} from '../models/product-record.model';

export async function getProductRecordByOrderId(
  orderId: string,
): Promise<ProductRecord | null> {
  try {
    const firestore = getFirestore();
    const productRecordsRef = firestore.collection('product-records');
    const querySnapshot = await productRecordsRef
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as ProductRecord)
      : null;
  } catch (error) {
    logger.info('Failed to get existing product record.', error);
    return null;
  }
}

export async function getFirstProductRecord(
  productId: string,
  email: string,
): Promise<ProductRecord | null> {
  try {
    const firestore = getFirestore();
    const productRecordsRef = firestore.collection('product-records');
    const querySnapshot = await productRecordsRef
      .where('productId', '==', productId)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as ProductRecord)
      : null;
  } catch (error) {
    logger.info('Failed to get existing product record.', error);
    return null;
  }
}

export async function getProductRecordById(
  productRecordId: string,
): Promise<ProductRecord | null> {
  try {
    const firestore = getFirestore();
    const productRecordsRef = firestore.collection('product-records');
    const querySnapshot = await productRecordsRef
      .where('id', '==', productRecordId)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as ProductRecord)
      : null;
  } catch (error) {
    logger.info('Failed to get existing product record.', error);
    return null;
  }
}

export async function updateProductRecord(
  productRecord: Partial<ProductRecord>,
  existingRecord: ProductRecord,
): Promise<ProductRecord | null> {
  const data = {
    ...existingRecord,
    ...productRecord,
    updatedAt: Timestamp.now(),
  };

  return upsertProductRecord(data);
}

export async function addProductRecord(
  productRecord: PartialProductRecord,
): Promise<ProductRecord | null> {
  const data = {
    ...productRecord,
    createdAt: Timestamp.now(),
    id: crypto.randomUUID(),
    updatedAt: Timestamp.now(),
  };

  return upsertProductRecord(data);
}

async function upsertProductRecord(
  productRecord: ProductRecord,
): Promise<ProductRecord | null> {
  try {
    const firestore = getFirestore();
    const recordRef = firestore
      .collection('product-records')
      .doc(productRecord.id);

    await recordRef.set(productRecord, { merge: false });

    const record = await recordRef.get();

    return record.exists ? (record.data() as ProductRecord) : null;
  } catch (error) {
    logger.error('Failed to add product record.', error);
    return null;
  }
}
