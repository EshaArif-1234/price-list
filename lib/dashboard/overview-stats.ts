import type { DashboardCategoryRow } from "@/lib/dashboard/category-catalog";
import type { DashboardSpecificationRow } from "@/lib/dashboard/specification-catalog";
import { SPECIFICATION_DEFAULT_SEED } from "@/lib/dashboard/specification-catalog";
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

function readDashboardSpecifications(
  raw: string | null,
): DashboardSpecificationRow[] {
  if (raw === null) return SPECIFICATION_DEFAULT_SEED;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SPECIFICATION_DEFAULT_SEED;
    return parsed
      .filter(
        (row): row is DashboardSpecificationRow =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as DashboardSpecificationRow).id === "string" &&
          typeof (row as DashboardSpecificationRow).key === "string" &&
          typeof (row as DashboardSpecificationRow).value === "string",
      )
      .map((row) => ({
        id: row.id,
        key: row.key.trim(),
        value: row.value.trim(),
      }))
      .filter((row) => row.key.length > 0 || row.value.length > 0);
  } catch {
    return SPECIFICATION_DEFAULT_SEED;
  }
}

export type DashboardOverviewCounts = {
  products: number;
  categories: number;
  specifications: number;
};

/** Matches counts shown in Products / Categories / Specifications admin tabs (localStorage). */
export function readDashboardOverviewCounts(storage: {
  productsRaw: string | null;
  categoriesRaw: string | null;
  specificationsRaw: string | null;
}): DashboardOverviewCounts {
  return {
    products: parseStoredProducts(storage.productsRaw).length,
    categories: readDashboardCategories(storage.categoriesRaw).length,
    specifications: readDashboardSpecifications(
      storage.specificationsRaw,
    ).length,
  };
}
