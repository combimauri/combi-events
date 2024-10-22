import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  onCall,
  CallableRequest,
  HttpsError,
} from 'firebase-functions/v2/https';
import {
  AppEvent,
  BillingData,
  EventRecord,
  PartialEventRecord,
  Price,
  WolipayIFrame,
  WolipayToken,
} from './models';

initializeApp();

const firestore = getFirestore();

export const createOrder = onCall(
  {
    secrets: [
      'WOLIPAY_BASE_PATH',
      'WOLIPAY_EMAIL',
      'WOLIPAY_NOTIFY_URL',
      'WOLIPAY_PASSWORD',
    ],
  },
  async (request: CallableRequest<any>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }

    const wolipayEmail = process.env.WOLIPAY_EMAIL;
    const wolipayPassword = process.env.WOLIPAY_PASSWORD;
    const wolipayBasePath = process.env.WOLIPAY_BASE_PATH;
    const wolipayNotifyUrl = process.env.WOLIPAY_NOTIFY_URL;

    if (
      !wolipayEmail ||
      !wolipayPassword ||
      !wolipayBasePath ||
      !wolipayNotifyUrl
    ) {
      throw new HttpsError(
        'internal',
        'Missing required environment variables.',
      );
    }

    const { eventId, fullName, phoneNumber, additionalAnswers } = request.data;

    if (!eventId || !fullName || !phoneNumber || !additionalAnswers) {
      throw new HttpsError('internal', 'Missing required fields.');
    }

    const event = await getEvent(eventId);

    if (!event) {
      throw new HttpsError('internal', 'Event does not exist.');
    }

    const token = await generateToken(
      wolipayEmail,
      wolipayPassword,
      wolipayBasePath,
    );

    if (!token) {
      throw new HttpsError('internal', 'Failed to generate token.');
    }

    const email = request.auth.token.email!;
    const billingData = await getWolipayiFrame(
      token,
      email,
      fullName,
      phoneNumber,
      event.name,
      event.price,
      wolipayBasePath,
      wolipayNotifyUrl,
    );

    if (!billingData) {
      throw new HttpsError('internal', 'Failed to generate billing data.');
    }

    const { orderId, paymentId, url } = billingData;
    const eventRecord: PartialEventRecord = {
      additionalAnswers,
      email,
      eventId,
      fullName,
      orderId,
      paymentId,
      phoneNumber,
    };
    const existingRecord = await getFirstEventRecord(eventId, email);
    const upsertedRecord = existingRecord
      ? await updateEventRecord(existingRecord.id, eventRecord, existingRecord)
      : await addEventRecord(eventRecord);

    if (!upsertedRecord) {
      throw new HttpsError('internal', 'Failed to create order.');
    }

    const { id: eventRecordId } = upsertedRecord;

    return {
      eventRecordId,
      orderId,
      paymentId,
      url,
    };
  },
);

export const validatePayment = onCall(
  {
    secrets: ['WOLIPAY_NOTIFY_URL'],
  },
  async (request: CallableRequest<any>) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }

    const wolipayNotifyUrl = process.env.WOLIPAY_NOTIFY_URL;

    if (!wolipayNotifyUrl) {
      throw new HttpsError(
        'internal',
        'Missing required environment variables.',
      );
    }

    const { orderId } = request.data;

    if (!orderId) {
      throw new HttpsError('internal', 'Missing required fields.');
    }

    try {
      return await fetch(wolipayNotifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
        }),
      });
    } catch {
      throw new HttpsError('internal', 'Failed to validate payment.');
    }
  },
);

async function getEvent(id: string): Promise<AppEvent | null> {
  try {
    const eventDoc = firestore.collection('events').doc(id);
    const eventSnapshot = await eventDoc.get();

    return eventSnapshot.exists ? (eventSnapshot.data() as AppEvent) : null;
  } catch {
    return null;
  }
}

async function getFirstEventRecord(
  eventId: string,
  email: string,
): Promise<EventRecord | null> {
  try {
    const eventRecordsRef = firestore.collection('event-records');
    const querySnapshot = await eventRecordsRef
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !querySnapshot.empty
      ? (querySnapshot.docs[0].data() as EventRecord)
      : null;
  } catch {
    return null;
  }
}

async function updateEventRecord(
  recordId: string,
  eventRecord: PartialEventRecord,
  existingRecord: EventRecord,
): Promise<EventRecord | null> {
  try {
    const data = {
      ...existingRecord,
      ...eventRecord,
      updatedAt: Timestamp.now(),
    };
    const recordRef = firestore.collection('event-records').doc(recordId);

    await recordRef.update(data);

    const updatedRecord = await recordRef.get();

    return updatedRecord.exists ? (updatedRecord.data() as EventRecord) : null;
  } catch (error) {
    return null;
  }
}

async function addEventRecord(
  eventRecord: PartialEventRecord,
): Promise<EventRecord | null> {
  try {
    const data = {
      ...eventRecord,
      createdAt: Timestamp.now(),
      id: crypto.randomUUID(),
      updatedAt: Timestamp.now(),
      validated: false,
    };
    const recordRef = firestore.collection('event-records').doc(data.id);

    await recordRef.set(data);

    const newRecord = await recordRef.get();

    return newRecord.exists ? (newRecord.data() as EventRecord) : null;
  } catch (error) {
    return null;
  }
}

async function generateToken(
  email: string,
  password: string,
  wolipayBasePath: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${wolipayBasePath}/generateToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: WolipayToken = await response.json();

    return data.body.token;
  } catch (error) {
    return null;
  }
}

async function getWolipayiFrame(
  token: string,
  email: string,
  fullName: string,
  phoneNumber: string,
  title: string,
  { description, amount, currency, discount }: Price,
  wolipayBasePath: string,
  wolipayNotifyUrl: string,
): Promise<BillingData | null> {
  try {
    const id = crypto.randomUUID();
    const splitName = fullName.split(' ');
    const lastName = splitName.pop();
    const firstName = splitName.join(' ') || lastName;
    const response = await fetch(`${wolipayBasePath}/getWolipayiFrame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id,
        title,
        description: description,
        notifyUrl: wolipayNotifyUrl,
        payment: {
          amount: amount,
          currency: currency,
          totalAmount: amount - discount,
          discount: {
            amount: discount,
            type: 'amount',
          },
        },
        billing: {
          firstName,
          lastName,
          email,
          phoneNumber,
        },
      }),
    });

    const data: WolipayIFrame = await response.json();
    const url = data.body.iFrameUrl;
    const paymentId = id;
    const lastSlashIndex = url.lastIndexOf('/');
    const orderId = url.substring(lastSlashIndex + 1);

    return {
      url,
      orderId,
      paymentId,
    };
  } catch (error) {
    return null;
  }
}
