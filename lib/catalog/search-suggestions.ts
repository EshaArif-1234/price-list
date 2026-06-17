import type { Product, ProductBrand } from "@/lib/types/product";

export type CatalogSearchHit = {
  id: string;
  name: string;
  image: string;
  categories: string[];
  price: number;
  brand: ProductBrand;
};

function scoreProduct(product: Product, query: string): number {
  const name = product.name.toLowerCase();
  const q = query.toLowerCase();

  if (name.startsWith(q)) return 100;
  if (name.includes(q)) return 80;
  if (product.categories.some((c) => c.toLowerCase().includes(q))) return 55;
  if (product.brand.toLowerCase().includes(q)) return 45;

  const haystack = [
    product.description,
    ...product.specifications.flatMap((s) => [s.label, s.value]),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q) ? 25 : 0;
}

export function searchCatalogSuggestions(
  products: Product[],
  query: string,
  limit = 8,
): CatalogSearchHit[] {
  const q = query.trim();
  if (!q) return [];

  return products
    .map((product) => ({ product, score: scoreProduct(product, q) }))
    .filter((row) => row.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.product.name.localeCompare(b.product.name, undefined, {
          sensitivity: "base",
        }),
    )
    .slice(0, limit)
    .map(({ product }) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      categories: product.categories,
      price: product.price,
      brand: product.brand,
    }));
}
