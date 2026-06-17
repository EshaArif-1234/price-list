import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import { parseStoredProducts } from "@/lib/dashboard/product-catalog";

function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function readDashboardCategories(raw: string | null): DashboardCategoryRow[] {
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is DashboardCategoryRow =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as DashboardCategoryRow).id === "string" &&
          typeof (row as DashboardCategoryRow).name === "string",
      )
      .map((row) => ({
        id: row.id,
        name: normalizeCategoryName(row.name),
      }))
      .filter((row) => row.name.length > 0);
  } catch {
    return [];
  }
}

export type DashboardOverviewCounts = {
  products: number;
  categories: number;
};

/** Matches counts shown in Products / Categories admin tabs (localStorage). */
export function readDashboardOverviewCounts(storage: {
  productsRaw: string | null;
  categoriesRaw: string | null;
}): DashboardOverviewCounts {
  return {
    products: parseStoredProducts(storage.productsRaw).length,
    categories: readDashboardCategories(storage.categoriesRaw).length,
  };
}
