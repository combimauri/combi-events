import { Timestamp } from '@angular/fire/firestore';

export interface SessionRecord {
  createdAt: Timestamp;
  email: string;
  eventId: string;
  fullName: string;
  id: string;
  registeredAt?: Timestamp;
  searchTerm: string;
  sessionId: string;
  sessionName: string;
  updatedAt: Timestamp;
}
