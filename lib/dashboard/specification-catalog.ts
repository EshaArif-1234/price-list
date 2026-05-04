/** Admin catalog rows: key maps to product `specifications[].label`. */
export type DashboardSpecificationRow = {
  id: string;
  key: string;
  value: string;
};

export const SPECIFICATION_LIST_PAGE_SIZE = 10;

export const SPECIFICATION_STORAGE_KEY = "dashboard_specifications_v1";

/** Minimal starter rows; pagination appears once list exceeds page size. */
export const SPECIFICATION_DEFAULT_SEED: DashboardSpecificationRow[] = [
  { id: "seed-1", key: "Material", value: "Stainless steel" },
  { id: "seed-2", key: "Finish", value: "Brushed" },
  { id: "seed-3", key: "Voltage", value: "220V" },
];
