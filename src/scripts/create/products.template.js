import { Timestamp } from 'firebase/firestore';

export const products = [
  {
    additionalQuestions: [
      {
        answer: '',
        key: 'ci',
        label: 'Carnet de Identidad',
        required: true,
        type: 'text',
      },
      {
        answer: '',
        key: 'city',
        label: 'Ciudad',
        required: true,
        type: 'text',
      },
    ],
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: Timestamp.fromDate(new Date()),
    description: 'Llévate un recuerdo de la Game Jam más grande de Bolivia.',
    eventId: 'wgj-bolivia-2025',
    id: '0b86b930-e025-4ee3-a23f-567bb377b52a',
    image:
      'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/products%2Fwgj-products-bundle.webp?alt=media&token=303215bc-14b1-4f0c-82c3-7548b6e82036',
    isActive: true,
    limit: 200,
    name: 'Paquete Souvenirs WGJ',
    price: {
      amount: 75,
      currency: 'BOB',
      description: '',
      discount: 0,
      qrs: [
        {
          id: 'main',
          link: 'https://firebasestorage.googleapis.com/v0/b/combi-events.appspot.com/o/events%2Fwgj-2025-main-qr.webp?alt=media&token=091b4abd-adf5-481c-9aa8-5d1c5e26fa00',
        },
      ],
    },
  },
];
