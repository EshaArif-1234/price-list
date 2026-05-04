import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { getStockDetailText } from "@/lib/catalog/stock-status";
import { getProductById } from "@/lib/data/products";
import type { ProductBrand } from "@/lib/types/product";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Product" };
  return {
    title: `${product.name} — Price List`,
    description: product.description.slice(0, 160),
  };
}

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

function stockBlock(stock: number) {
  const { text, tone } = getStockDetailText(stock);
  const className =
    tone === "ok"
      ? "font-semibold text-green-700"
      : "font-semibold text-red-700";
  return <span className={className}>{text}</span>;
}

function brandBadge(brand: ProductBrand) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide sm:px-3 sm:text-xs ${
        brand === "Ambassador"
          ? "bg-secondary/12 text-secondary"
          : "bg-primary/12 text-primary"
      }`}
    >
      {brand}
    </span>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-muted py-2.5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-x-4 sm:py-3 md:items-center">
      <dt className="shrink-0 text-xs font-medium text-secondary/65 sm:text-sm">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-left text-[15px] text-secondary sm:text-right md:text-base md:text-secondary">
        {children}
      </dd>
    </div>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <CatalogWidth className="flex min-w-0 flex-1 flex-col py-5 sm:py-7 lg:py-10 xl:py-12">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-secondary px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 active:bg-secondary/90 sm:mb-6 sm:w-fit sm:justify-start sm:py-3 md:min-w-[11rem]"
      >
        ← Back to products
      </Link>

      <div className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg border border-muted bg-muted sm:max-w-none sm:rounded-xl lg:mx-0 lg:max-w-none lg:aspect-square lg:sticky lg:top-[calc(5.5rem+env(safe-area-inset-top,0px))] xl:top-[calc(6.25rem+env(safe-area-inset-top,0px))] 2xl:top-28">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 640px) 96vw, (max-width: 1024px) 92vw, (max-width: 1280px) 45vw, 560px"
            className="object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:gap-8">
          <header className="border-l-[3px] border-primary pl-3 sm:border-l-4 sm:pl-4">
            <h1 className="text-balance text-xl font-semibold tracking-tight text-secondary min-[360px]:text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] xl:leading-tight">
              {product.name}
            </h1>
          </header>

          <dl className="rounded-lg border border-muted bg-surface px-3.5 py-1 sm:rounded-xl sm:px-5 sm:py-1">
            <DetailRow label="Category">{product.category}</DetailRow>
            <DetailRow label="Brand">{brandBadge(product.brand)}</DetailRow>
            <DetailRow label="Stock">{stockBlock(product.stock)}</DetailRow>
            <DetailRow label="Price">
              <span className="inline-block text-xl font-semibold tabular-nums text-green-700 min-[380px]:text-2xl sm:text-3xl">
                {formatPrice(product.price, product.currency)}
              </span>
            </DetailRow>
          </dl>

          <section className="rounded-lg border border-muted bg-surface p-3.5 sm:rounded-xl sm:p-5 lg:p-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary/70 sm:mb-3 sm:text-sm">
              Description
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-secondary/85 sm:text-base sm:leading-relaxed lg:max-w-prose lg:text-[17px] lg:leading-relaxed">
              {product.description}
            </p>
          </section>

          {product.specifications.length > 0 ? (
            <section className="rounded-lg border border-muted bg-surface p-3.5 sm:rounded-xl sm:p-5 lg:p-6">
              <h2 className="mb-3 border-b border-muted pb-2 text-base font-semibold text-secondary sm:mb-4 sm:pb-3 sm:text-lg">
                Specifications
              </h2>
              <dl className="grid min-w-0 gap-0">
                {product.specifications.map((spec, index) => (
                  <div
                    key={`${product.id}-spec-${index}`}
                    className="flex flex-col gap-1 border-b border-muted py-2.5 last:border-b-0 sm:grid sm:grid-cols-[minmax(7rem,34%)_1fr] sm:items-start sm:gap-x-4 sm:py-3 md:grid-cols-[minmax(10rem,38%)_1fr] md:gap-x-8 lg:items-baseline"
                  >
                    <dt className="text-xs font-semibold text-secondary sm:text-sm">
                      {spec.label}
                    </dt>
                    <dd className="min-w-0 break-words text-sm leading-relaxed text-secondary/85 hyphens-auto sm:text-base">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </CatalogWidth>
  );
}
