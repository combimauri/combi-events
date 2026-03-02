import { Timestamp } from 'firebase-admin/firestore';
import { Price } from './price.model';

export interface AdditionalQuestion {
  answer?: string | string[];
  key: string;
  label: string;
  description?: string;
  multiple?: boolean;
  options?: string[];
  optionWithDiscount?: string;
  required: boolean;
  type: 'text' | 'select' | 'info';
  dependsOn?: { question: string; answer: string };
  visible?: boolean;
}

export type AppEvent = {
  id: string;
  additionalQuestions: AdditionalQuestion[];
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
