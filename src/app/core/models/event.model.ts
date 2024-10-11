import { GeoPoint, Timestamp } from '@angular/fire/firestore';

export interface Event {
  bannerImage: string;
  capacity: number;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  id: string;
  image: string;
  location: { name: string; geolocation: GeoPoint };
  name: string;
  price: {
    amount: number;
    discount: number;
    currency: string;
    description: string;
  };
  shortDescription: string;
}
