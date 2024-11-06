import { Timestamp } from 'firebase-admin/firestore';

export interface PartialSessionRecord {
  email: string;
  eventId: string;
  fullName: string;
  phoneNumber: string;
  sessionId: string;
  sessionName: string;
  searchTerm: string;
}

export interface SessionRecord extends PartialSessionRecord {
  createdAt: Timestamp;
  id: string;
  updatedAt: Timestamp;
}
