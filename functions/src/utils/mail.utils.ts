import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { AppEvent } from '../models/app-event.model';
import { EventRecord } from '../models/event-record.model';

export async function sendReceiptRegistrationEmail(
  event: AppEvent,
  eventRecord: EventRecord,
): Promise<void> {
  try {
    const { paymentReceipts } = eventRecord;

    if (!paymentReceipts) {
      return;
    }

    const mainReceipt = paymentReceipts.find(
      (receipt) => receipt.id === 'main',
    );

    if (!mainReceipt) {
      return;
    }

    let receiptsHtml = '';

    mainReceipt.links.forEach((link, index) => {
      receiptsHtml =
        receiptsHtml +
        `<a href="${link}" target="_blank" rel="noreferrer">Comprobante de Pago ${index + 1}</a><br>`;
    });
    const html = `¡Hola organizador!<br><br><b>${eventRecord.fullName}</b> se acaba de registrar a tu evento <b>${event.name}</b><br><br>Aquí puedes revisar sus comprobantes de pago:<br>${receiptsHtml}<br>No olvides verificarlos y validar su registro en el <a href="https://events.combimauri.com/${event.id}/admin" target="_blank" rel="noreferrer">administrador</a>.<br><br>¡Éxitos con tu evento!`;
    const firestore = getFirestore();
    await firestore.collection('mail').add({
      to: [event.owner],
      message: { subject: '¡Nuevo registro en tu evento!', html },
    });
  } catch (error) {
    logger.error('Failed to add mail.', error);
  }
}
