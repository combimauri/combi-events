import { GeoPoint, Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';
import { Price } from './price.model';

export interface AppEvent {
  admins: string[];
  bannerImage: string;
  capacity: number;
  createdAt: Timestamp;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  id: string;
  image: string;
  location: { name: string; geolocation: GeoPoint };
  name: string;
  openRegistration: boolean;
  owner: string;
  price: Price;
  registrationAdditionalQuestions: AdditionalQuestion[];
  shortDescription: string;
  updatedAt: Timestamp;
}
