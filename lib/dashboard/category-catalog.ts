import { getCategories } from "@/lib/data/products";

export type DashboardCategoryRow = {
  id: string;
  name: string;
};

export const CATEGORY_LIST_PAGE_SIZE = 10;

export const CATEGORY_STORAGE_KEY = "dashboard_categories_v1";

/** Mirrors categories derived from catalog data until a backend exists. */
export const CATEGORY_DEFAULT_SEED: DashboardCategoryRow[] =
  getCategories().map((name, index) => ({
    id: `seed-${index}-${encodeURIComponent(name)}`,
    name,
  }));
