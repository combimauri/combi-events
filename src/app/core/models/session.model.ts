import { Timestamp } from '@angular/fire/firestore';

export interface Session {
  count: number;
  createdAt: Timestamp;
  date: { end: Timestamp; start: Timestamp };
  description: string;
  eventId: string;
  id: string;
  isActive: boolean;
  isRegistered?: boolean;
  limit: number;
  name: string;
  overlapsWith: string[];
  requirements: string;
  speaker: { email: string; name: string; photoUrl: string };
  updatedAt: Timestamp;
}
