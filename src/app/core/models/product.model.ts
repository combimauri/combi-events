import { Timestamp } from '@angular/fire/firestore';
import { AdditionalQuestion } from './additional-question.model';
import { Price } from './price.model';

export interface Product {
  additionalQuestions: AdditionalQuestion[];
  count: number;
  createdAt: Timestamp;
  description: string;
  eventId: string;
  id: string;
  image: string;
  isActive: boolean;
  limit: number;
  name: string;
  price: Price;
  updatedAt: Timestamp;
}
