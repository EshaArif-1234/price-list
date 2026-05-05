export type DashboardCategoryRow = {
  id: string;
  name: string;
};

export type DeleteCategoryResponse = {
  categories: DashboardCategoryRow[];
  deletedProductCount: number;
};

export const CATEGORY_LIST_PAGE_SIZE = 10;

export const CATEGORY_STORAGE_KEY = "dashboard_categories_v1";

/** Categories are created only in Dashboard → Categories (MongoDB or browser storage). No baked-in defaults. */
