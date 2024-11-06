import { Price } from './price.model';

export type AppEvent = {
  maxSessionsPerUser: number;
  name: string;
  price: Price;
};
