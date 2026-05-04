import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/types/product";
import { getStockDisplay } from "@/lib/catalog/stock-status";

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const stock = getStockDisplay(product.stock);

  return (
    <article className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-muted bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 419px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-5">
        <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-pretty text-[15px] font-semibold leading-snug text-secondary sm:text-base lg:text-[17px]">
            {product.name}
          </h2>
          <span className="inline-flex w-fit shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-secondary/90">
            {product.category}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span
            className={
              stock.tone === "ok"
                ? "font-semibold text-green-700"
                : "font-semibold text-red-700"
            }
          >
            {stock.text}
          </span>
          <span className="text-secondary/35" aria-hidden>
            ·
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              product.brand === "Ambassador"
                ? "bg-secondary/12 text-secondary"
                : "bg-primary/12 text-primary"
            }`}
          >
            {product.brand}
          </span>
        </div>

        <p className="mb-3 text-xl font-semibold text-green-700 lg:text-2xl">
          {formatPrice(product.price, product.currency)}
        </p>

        <p className="mb-4 line-clamp-3 text-pretty text-sm leading-relaxed text-secondary/75 lg:text-[15px]">
          {product.description}
        </p>

        <Link
          href={`/products/${product.id}`}
          className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-primary bg-transparent py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          View detail
        </Link>
      </div>
    </article>
  );
}
