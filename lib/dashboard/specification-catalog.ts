/**
 * Admin catalog rows: `key` becomes the product spec label on the storefront.
 * `value` is optional legacy/template text; prefer leaving it empty and setting
 * values per product when editing a product.
 */
export type DashboardSpecificationRow = {
  id: string;
  key: string;
  value: string;
};

export const SPECIFICATION_LIST_PAGE_SIZE = 10;

export const SPECIFICATION_STORAGE_KEY = "dashboard_specifications_v1";

/** Minimal starter rows; pagination appears once list exceeds page size. */
export const SPECIFICATION_DEFAULT_SEED: DashboardSpecificationRow[] = [
  { id: "seed-1", key: "Material", value: "" },
  { id: "seed-2", key: "Finish", value: "" },
  { id: "seed-3", key: "Voltage", value: "" },
];
