import { GeoPoint, Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';

export interface AppEvent {
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
  registrationAdditionalQuestions: AdditionalQuestion[];
  openRegistration: boolean;
  betaAccess?: string[];
  owner: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
