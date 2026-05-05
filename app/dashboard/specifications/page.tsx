import type { Metadata } from "next";

import { SpecificationsAdmin } from "@/components/dashboard/specifications/SpecificationsAdmin";

export const metadata: Metadata = {
  title: "Specifications — Dashboard",
  description:
    "Manage reusable specification labels for products (values are set per product).",
};

export default function DashboardSpecificationsPage() {
  return <SpecificationsAdmin />;
}
