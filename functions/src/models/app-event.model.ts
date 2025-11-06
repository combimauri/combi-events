import { Timestamp } from 'firebase-admin/firestore';
import { Price } from './price.model';

export type AppEvent = {
  id: string;
  bannerImage: string;
  capacity: number;
  count: number;
  maxSessionsPerUser: number;
  name: string;
  description: string;
  owner: string;
  price: Price;
  openRegistration: boolean;
  date: { end: Timestamp; start: Timestamp };
  location: { name: string };
};
