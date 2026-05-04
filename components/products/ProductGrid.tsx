import type { Product } from "@/lib/types/product";

import { ProductCard } from "@/components/products/ProductCard";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted bg-surface px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
        <p className="text-base font-medium text-secondary min-[400px]:text-lg">
          No products match your filters.
        </p>
        <p className="mt-2 text-pretty text-sm text-secondary/70">
          Try clearing the search or choosing “All categories”.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 min-[420px]:gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6 2xl:grid-cols-4 min-[1800px]:gap-8">
      {products.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
