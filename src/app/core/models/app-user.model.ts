import { Timestamp } from '@angular/fire/firestore';

export type UserRole = 'admin';

/**
 * Document stored at `users/{uid}` (the Firebase Auth uid). Roles are granted
 * manually (console / Admin SDK); the client can only read its own document.
 */
export interface AppUser {
  email?: string;
  roles?: UserRole[];
  updatedAt?: Timestamp;
}
