import type { Product } from "@/lib/types/product";

export type CatalogStockTab = "in" | "out";

/** Default listing: in-stock items (`stock=out` shows only out-of-stock). */
export function parseCatalogStockTab(
  raw: string | undefined,
): CatalogStockTab {
  return raw === "out" ? "out" : "in";
}

export function filterProducts(
  products: Product[],
  query: string | undefined,
  category: string | undefined,
  stockTab: CatalogStockTab,
): Product[] {
  const q = query?.trim().toLowerCase() ?? "";
  const cat = category?.trim();

  return products.filter((p) => {
    const inStock = p.stock > 0;
    if (stockTab === "in" && !inStock) return false;
    if (stockTab === "out" && inStock) return false;

    const matchesCategory =
      !cat ||
      cat === "all" ||
      p.categories.some((c) => c.toLowerCase() === cat.toLowerCase());

    if (!matchesCategory) return false;
    if (!q) return true;

    const haystack = [
      p.name,
      p.description,
      ...p.categories,
      p.brand,
      String(p.price),
      String(p.stock),
      ...p.specifications.flatMap((s) => [s.label, s.value]),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
