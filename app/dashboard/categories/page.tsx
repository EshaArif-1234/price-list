import type { Metadata } from "next";

import { CategoriesAdmin } from "@/components/dashboard/categories/CategoriesAdmin";

export const metadata: Metadata = {
  title: "Categories — Dashboard",
  description:
    "Create, edit, and delete catalog categories (MongoDB when available, otherwise browser storage).",
};

export default function DashboardCategoriesPage() {
  return <CategoriesAdmin />;
}
