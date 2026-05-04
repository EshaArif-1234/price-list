import type { Metadata } from "next";

import { ProductsAdmin } from "@/components/dashboard/products/ProductsAdmin";

export const metadata: Metadata = {
  title: "Products — Dashboard",
  description:
    "Manage catalog products: search, add, edit, or delete items stored locally until a backend is connected.",
};

export default function DashboardProductsPage() {
  return <ProductsAdmin />;
}
