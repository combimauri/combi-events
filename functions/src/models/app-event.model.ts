import { Price } from './price.model';

export type AppEvent = {
  id: string
  capacity: number;
  count: number;
  maxSessionsPerUser: number;
  name: string;
  owner: string;
  price: Price;
};
