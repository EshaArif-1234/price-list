export const CATALOG_PAGE_SIZE = 10;

export function parseCatalogPage(raw: string | string[] | undefined): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(s ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function getCatalogPageSlice<T>(
  items: T[],
  page: number,
  pageSize = CATALOG_PAGE_SIZE,
) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { slice, totalPages, totalItems, page: safePage };
}
