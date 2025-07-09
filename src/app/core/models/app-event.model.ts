import { GeoPoint, Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';
import { Price } from './price.model';

export interface AppEvent {
  additionalQuestions: AdditionalQuestion[];
  additionalRegistrationInfo?: string;
  admins: string[];
  bannerImage: string;
  capacity: number;
  count: number;
  createdAt: Timestamp;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  hasMarketplace: boolean;
  hasSessions: boolean;
  id: string;
  image: string;
  listEvent: boolean;
  location: { name: string; geolocation?: GeoPoint };
  maxSessionsPerUser: number;
  name: string;
  openMarketplace: boolean;
  openRegistration: boolean;
  owner: string;
  price: Price;
  shortDescription: string;
  updatedAt: Timestamp;
}
