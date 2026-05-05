import type { Product } from "@/lib/types/product";

/** Drops products whose category labels match `categoryName` (case-insensitive, trimmed). */
export function removeProductsHavingCategoryLabel(
  products: Product[],
  categoryName: string,
): Product[] {
  const needle = categoryName.trim().toLowerCase();
  if (!needle) return products;
  return products.filter(
    (p) =>
      !p.categories.some((c) => c.trim().toLowerCase() === needle),
  );
}
