import { Timestamp } from 'firebase-admin/firestore';

export type Session = {
  count: number;
  date: { start: Timestamp; end: Timestamp };
  eventId: string;
  id: string;
  isActive: boolean;
  limit: number;
  name: string;
  overlapsWith: string[];
};
