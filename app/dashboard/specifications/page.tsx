import type { Metadata } from "next";

import { SpecificationsAdmin } from "@/components/dashboard/specifications/SpecificationsAdmin";

export const metadata: Metadata = {
  title: "Specifications — Dashboard",
  description: "Manage specification keys and values for catalog items.",
};

export default function DashboardSpecificationsPage() {
  return <SpecificationsAdmin />;
}
