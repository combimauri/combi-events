const firebaseEmail = '';
const firebaseKey = '';
const firebaseProjectId = '';
const firestore = FirestoreApp.getFirestore(
  firebaseEmail,
  firebaseKey,
  firebaseProjectId,
);
const wolipayEndpoint = '';
const wolipayEmail = '';
const wolipayPassword = '';

function doPost(e) {
  const contents = JSON.parse(e.postData.contents);
  const orderId = contents.orderId;

  const eventRecordDocs = firestore
    .query('event-records')
    .Where('orderId', '==', orderId)
    .Execute();
  const eventRecord = eventRecordDocs[0].obj;
  const paymentId = eventRecord.paymentId;

  const tokenResponse = UrlFetchApp.fetch(wolipayEndpoint + '/generateToken', {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify({ email: wolipayEmail, password: wolipayPassword }),
  });
  const tokenContent = JSON.parse(tokenResponse.getContentText());
  const token = tokenContent.body.token;

  const paymentResponse = UrlFetchApp.fetch(
    wolipayEndpoint + '/getPaymentById?id=' + paymentId,
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    },
  );
  const paymentContent = JSON.parse(paymentResponse.getContentText());
  const paymentStatus = paymentContent.body.order.payment.status;

  try {
    firestore.createDocument(
      'payments/' + paymentId,
      paymentContent.body.order,
    );
  } catch {
    firestore.updateDocument(
      'payments/' + paymentId,
      paymentContent.body.order,
    );
  }

  firestore.updateDocument(
    'event-records/' + eventRecord.id,
    { validated: paymentStatus === 'success' },
    true,
  );

  return ContentService.createTextOutput(paymentStatus);
}
