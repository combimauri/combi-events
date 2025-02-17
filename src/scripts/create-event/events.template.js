import { Timestamp, GeoPoint } from 'firebase/firestore';

export const events = [
  {
    additionalQuestions: [],
    admins: [],
    bannerImage:
      'https://firebasestorage.googleapis.com/v0/b/gdg-bo-events.appspot.com/o/events%2FmKCuk3bUZ72veZJLM56h-banner.webp?alt=media&token=034c453e-9ba4-40db-a1b1-c7ed8b8376f8',
    capacity: 100,
    count: 0,
    createdAt: Timestamp.fromDate(new Date()),
    date: {
      start: Timestamp.fromDate(new Date('2025-02-22T08:30:00-04:00')),
      end: Timestamp.fromDate(new Date('2025-02-22T14:30:00-04:00')),
    },
    description: 'This is a sample event for demonstration purposes.',
    hasMarketplace: false,
    hasSessions: false,
    id: 'event1',
    image:
      'https://firebasestorage.googleapis.com/v0/b/gdg-bo-events.appspot.com/o/events%2FmKCuk3bUZ72veZJLM56h.webp?alt=media&token=f060f529-3897-4ce2-bee1-f164f21054ef',
    listEvent: true,
    location: {
      name: 'New York, NY',
      geolocation: new GeoPoint(40.7128, -74.006),
    },
    maxSessionsPerUser: 2,
    name: 'Sample Event',
    openMarketplace: false,
    openRegistration: true,
    owner: 'mauricio.arce.mat@gmail.com',
    price: {
      amount: 20,
      currency: 'BOB',
      discount: 0,
      description: 'General Admission',
    },
    shortDescription: 'Sample event short description.',
    updatedAt: Timestamp.fromDate(new Date()),
  },
];
