import { GeoPoint, Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';
import { Price } from './price.model';

export interface AppEvent {
  additionalQuestions: AdditionalQuestion[];
  admins: string[];
  bannerImage: string;
  capacity: number;
  createdAt: Timestamp;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  id: string;
  image: string;
  location: { name: string; geolocation: GeoPoint };
  maxSessionsPerUser: number;
  name: string;
  openMarketplace: boolean;
  openRegistration: boolean;
  owner: string;
  price: Price;
  shortDescription: string;
  updatedAt: Timestamp;
}
