import { Timestamp } from '@angular/fire/firestore';

export type UserRole = 'admin';

/**
 * Document stored at `users/{email}`. Roles are granted manually (console /
 * Admin SDK); the client can only read its own document.
 */
export interface AppUser {
  displayName?: string;
  email?: string;
  photoURL?: string;
  roles?: UserRole[];
  updatedAt?: Timestamp;
}
