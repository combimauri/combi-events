import { Price } from './price.model';

export type AppEvent = {
  capacity: number;
  count: number;
  maxSessionsPerUser: number;
  name: string;
  price: Price;
};
