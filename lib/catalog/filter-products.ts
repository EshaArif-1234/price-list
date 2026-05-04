import type { Product } from "@/lib/types/product";

export function filterProducts(
  products: Product[],
  query: string | undefined,
  category: string | undefined,
): Product[] {
  const q = query?.trim().toLowerCase() ?? "";
  const cat = category?.trim();

  return products.filter((p) => {
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
