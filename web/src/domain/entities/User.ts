// ─── Domain Entity ────────────────────────────────────────────────────────────
// Pure business object. No React, no Axios, no framework dependencies.
// ──────────────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}
