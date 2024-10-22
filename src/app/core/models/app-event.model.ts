import { GeoPoint, Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';
import { Price } from './price.model';

export interface AppEvent {
  bannerImage: string;
  capacity: number;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  id: string;
  image: string;
  location: { name: string; geolocation: GeoPoint };
  name: string;
  price: Price;
  shortDescription: string;
  registrationAdditionalQuestions: AdditionalQuestion[];
  openRegistration: boolean;
  owner: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
