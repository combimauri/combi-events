import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { AppEvent } from '../models/app-event.model';
import { EventRecord } from '../models/event-record.model';
import { ProductRecord } from '../models/product-record.model';

export async function sendEventRegistrationEmail(
  event: AppEvent,
  eventRecord: EventRecord,
): Promise<void> {
  try {
    const { name: eventName, date, location, bannerImage } = event;
    const { email, fullName } = eventRecord;
    const dateDescription = buildDateDescription(date);
    const subject = `¡Registro exitoso en "${eventName}"!`;
    const html = `<div><img src="${bannerImage}" alt="Banner del evento" height="200"/></div><p>¡Hola ${fullName}!</p><p>Tu registro al evento <b>${eventName}</b> fue exitoso.</p><p>Te esperamos en <b>${location.name}</b> el <b>${dateDescription}</b>.</p><p>Puedes encontrar tu entrada iniciando sesión en la página del evento en <a href="https://events.combimauri.com/${event.id}" target="_blank" rel="noreferrer">Combieventos</a>.</p>`;
    const firestore = getFirestore();
    await firestore.collection('mail').add({
      to: [email],
      message: { subject, html },
    });
  } catch (error) {
    logger.error('Failed to add mail.', error);
  }
}

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

export async function sendReceiptProductEmail(
  event: AppEvent,
  productRecord: ProductRecord,
): Promise<void> {
  try {
    const { paymentReceipts } = productRecord;

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
    const html = `¡Hola organizador!<br><br><b>${productRecord.fullName}</b> compró en Marketplace el producto <b>${productRecord.productName}</b><br><br>Aquí puedes revisar sus comprobantes de pago:<br>${receiptsHtml}<br>No olvides verificarlos y validar su compra en el <a href="https://events.combimauri.com/${event.id}/admin" target="_blank" rel="noreferrer">administrador</a>.<br><br>¡Éxitos con tu evento!`;
    const firestore = getFirestore();
    await firestore.collection('mail').add({
      to: [event.owner],
      message: { subject: '¡Nueva compra en tu evento!', html },
    });
  } catch (error) {
    logger.error('Failed to add mail.', error);
  }
}

function buildDateDescription(date: {
  end: Timestamp;
  start: Timestamp;
}): string {
  return `día ${date.start.toDate().toLocaleDateString('es-ES', {
    timeZone: 'America/La_Paz',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} de ${date.start.toDate().toLocaleTimeString('es-ES', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
  })} a ${date.end.toDate().toLocaleTimeString('es-ES', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
