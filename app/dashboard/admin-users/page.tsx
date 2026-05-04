import type { Metadata } from "next";

import { AdminUsersAdmin } from "@/components/dashboard/admin-users/AdminUsersAdmin";

export const metadata: Metadata = {
  title: "Admin accounts — Dashboard",
  description: "Manage dashboard sign-in accounts stored in MongoDB.",
};

export default function DashboardAdminUsersPage() {
  return <AdminUsersAdmin />;
}
