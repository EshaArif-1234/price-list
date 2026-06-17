import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogProductImage } from "@/components/products/CatalogProductImage";
import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { ProductDetailBreadcrumbs } from "@/components/catalog/ProductDetailBreadcrumbs";
import { getStockDetailText } from "@/lib/catalog/stock-status";
import { getCatalogProductById } from "@/lib/catalog/server-catalog";
import { formatCatalogPrice } from "@/lib/format-product-price";
import type { ProductBrand, ProductSpecification } from "@/lib/types/product";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getCatalogProductById(id);
  if (!product) return { title: "Product" };
  return {
    title: `${product.name} — Price List`,
    description: product.description.slice(0, 160),
  };
}

function brandBadge(brand: ProductBrand) {
  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide sm:text-[13px] ${
        brand === "Ambassador"
          ? "border-secondary/25 bg-secondary/[0.06] text-secondary"
          : "border-primary/35 bg-primary/[0.06] text-primary"
      }`}
    >
      {brand}
    </span>
  );
}

function stockLabel(stock: number) {
  const { text, tone } = getStockDetailText(stock);
  const className =
    tone === "ok"
      ? "text-green-700"
      : tone === "low"
        ? "text-red-700"
        : "text-red-700";
  return <span className={`text-sm font-medium ${className}`}>{text}</span>;
}

function splitSpecifications(specs: ProductSpecification[]) {
  const midpoint = Math.ceil(specs.length / 2);
  return {
    left: specs.slice(0, midpoint),
    right: specs.slice(midpoint),
  };
}

function SpecColumn({ specs }: { specs: ProductSpecification[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="min-w-0">
      {specs.map((spec, index) => (
        <div
          key={`${spec.label}-${index}`}
          className="flex items-baseline justify-between gap-x-4 border-b border-secondary/[0.08] py-3.5 last:border-b-0"
        >
          <dt className="shrink-0 text-[13px] font-bold text-secondary sm:text-sm">
            {spec.label}:
          </dt>
          <dd className="min-w-0 text-right text-[13px] leading-snug text-secondary/85 sm:text-sm">
            {spec.value.trim() ? spec.value : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getCatalogProductById(id);
  if (!product) notFound();

  const specColumns = splitSpecifications(product.specifications);
  const categoryLine =
    product.categories.length > 0 ? product.categories.join(" · ") : "Uncategorized";

  return (
    <CatalogWidth className="flex min-w-0 flex-1 flex-col py-5 sm:py-7 lg:py-8 xl:py-10">
      <ProductDetailBreadcrumbs productName={product.name} />

      <article className="overflow-hidden rounded-2xl border border-secondary/[0.08] bg-white shadow-[0_8px_30px_-12px_rgba(15,76,105,0.18)]">
        <div className="grid min-w-0 gap-8 p-5 sm:gap-10 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:p-10 xl:gap-14">
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-xl border border-secondary/[0.06] bg-[#fafafa] lg:sticky lg:top-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:mx-0 lg:max-w-none xl:top-[calc(6.25rem+env(safe-area-inset-top,0px))]">
            <CatalogProductImage
              src={product.image}
              alt={product.name}
              fill
              priority
              width={700}
              sizes="(max-width: 1024px) 92vw, 45vw"
              className="object-contain p-4 sm:p-6"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
            <header className="min-w-0 space-y-2">
              <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-secondary sm:text-3xl lg:text-[2rem] lg:leading-[1.2]">
                {product.name}
              </h1>
              <p className="text-[15px] text-secondary/55 sm:text-base">
                {categoryLine}
              </p>
            </header>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {brandBadge(product.brand)}
              {stockLabel(product.stock)}
            </div>

            <p className="text-3xl font-bold tabular-nums tracking-tight text-primary sm:text-4xl">
              {formatCatalogPrice(product.price)}
            </p>

            <section className="min-w-0 border-t border-secondary/[0.08] pt-5 sm:pt-6">
              <h2 className="mb-3 text-base font-bold text-secondary sm:text-lg">
                About the Product
              </h2>
              <p className="text-pretty text-[15px] leading-relaxed text-secondary/80 sm:text-base sm:leading-7">
                {product.description}
              </p>
            </section>
          </div>
        </div>

        {product.specifications.length > 0 ? (
          <section className="border-t border-secondary/[0.08] px-5 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            <h2 className="mb-5 text-lg font-bold text-secondary sm:mb-6 sm:text-xl">
              Specifications
            </h2>
            <div className="grid min-w-0 grid-cols-1 gap-x-12 md:grid-cols-2 md:gap-x-16 lg:gap-x-20">
              <SpecColumn specs={specColumns.left} />
              <SpecColumn specs={specColumns.right} />
            </div>
          </section>
        ) : null}
      </article>
    </CatalogWidth>
  );
}
