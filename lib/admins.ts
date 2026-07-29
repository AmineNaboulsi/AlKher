/** Shared admin-account shapes. */

export type AdminDocument = {
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
};

export const ADMINS_COLLECTION = "admins";
