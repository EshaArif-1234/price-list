/** Shared shape for dashboard admin accounts (safe for client bundles). */
export type AdminUserPublic = {
  id: string;
  email: string;
};

export const DEFAULT_ADMIN_EMAIL = "info@ambassador.pk";
