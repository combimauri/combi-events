import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { Coupon } from '../models/coupon.model';

export async function getCouponById(id: string): Promise<Coupon | null> {
  try {
    const firestore = getFirestore();
    const couponDoc = firestore.collection('coupons').doc(id);
    const couponSnapshot = await couponDoc.get();

    return couponSnapshot.exists ? (couponSnapshot.data() as Coupon) : null;
  } catch (error) {
    logger.error('Failed to get coupon by id.', error);
    return null;
  }
}
export async function getCouponByIdAndEventId(
  id: string | null,
  eventId: string,
): Promise<Coupon | null> {
  return getCouponByIdAndDocumentId(id, eventId, 'eventId');
}

export async function getCouponByIdAndProductId(
  id: string | null,
  productId: string,
): Promise<Coupon | null> {
  return getCouponByIdAndDocumentId(id, productId, 'productId');
}

export async function incrementCouponCount(
  couponId: string,
): Promise<Coupon | null> {
  try {
    const firestore = getFirestore();
    const couponRef = firestore.collection('coupons').doc(couponId);

    // Increment the count property by one
    await couponRef.update({
      count: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });

    const updatedCoupon = await couponRef.get();

    return updatedCoupon.exists ? (updatedCoupon.data() as Coupon) : null;
  } catch (error) {
    logger.error('Failed to increment coupon count.', error);
    return null;
  }
}

async function getCouponByIdAndDocumentId(
  id: string | null,
  documentId: string,
  documentKey: string,
): Promise<Coupon | null> {
  if (!id) {
    logger.info('No coupon provided.');
    return null;
  }

  try {
    const firestore = getFirestore();
    const couponsRef = firestore.collection('coupons');
    const querySnapshot = await couponsRef
      .where('id', '==', id)
      .where(documentKey, '==', documentId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      logger.error('Coupon not found.');
      return null;
    }

    const coupon = querySnapshot.docs[0].data() as Coupon;

    if (coupon.count < coupon.limit) {
      return coupon;
    }

    logger.error('Coupon limit reached.');
    return null;
  } catch (error) {
    logger.error('Failed to get coupon.', error);
    return null;
  }
}
