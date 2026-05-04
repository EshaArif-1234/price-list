import { CatalogPagination } from "@/components/products/CatalogPagination";
import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  CATALOG_PAGE_SIZE,
  getCatalogPageSlice,
  parseCatalogPage,
} from "@/lib/catalog/pagination";
import { filterProducts } from "@/lib/catalog/filter-products";
import { getCatalogProducts } from "@/lib/catalog/server-catalog";

type HomeProps = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const pageRaw = parseCatalogPage(params.page);

  const products = await getCatalogProducts();
  const filtered = filterProducts(products, q, category);
  const { slice, totalPages, page } = getCatalogPageSlice(
    filtered,
    pageRaw,
    CATALOG_PAGE_SIZE,
  );

  const paginationQuery = { q, category };

  const totalCount = products.length;
  const visibleCount = filtered.length;
  const hasFilters = Boolean(q?.trim()) || Boolean(category && category !== "all");

  return (
    <CatalogWidth className="flex flex-1 flex-col py-6 sm:py-8 lg:py-10 xl:py-12">
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-secondary/[0.09] bg-gradient-to-br from-white via-white to-secondary/[0.04] px-5 py-8 shadow-[0_1px_3px_rgba(15,76,105,0.06),0_14px_44px_-14px_rgba(15,76,105,0.14)] sm:mb-10 sm:rounded-[1.35rem] sm:px-8 sm:py-10 lg:mb-12 lg:rounded-3xl lg:px-10 lg:py-11 xl:py-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/90 to-secondary"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="min-w-0 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-secondary/[0.045] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary/55">
              <span
                className="size-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              Commercial catalog
            </div>
            <div className="space-y-3">
              <h1 className="text-balance font-semibold tracking-tight text-secondary text-[1.65rem] leading-[1.15] sm:text-[2rem] sm:leading-[1.12] lg:text-[2.35rem] xl:text-[2.5rem] xl:leading-[1.08]">
                Product showcase
              </h1>
              <p className="max-w-2xl text-pretty text-[15px] leading-relaxed text-secondary/68 sm:text-base lg:text-[17px] lg:leading-relaxed">
                Explore Ambassador commercial kitchen equipment and supplies.
                Filter by category from the header, or search across names,
                categories, brands, and specifications — pricing shown in PKR.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-secondary/[0.07] bg-white/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6 sm:px-5 lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
            <div className="text-center sm:text-left lg:text-center xl:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/45">
                In catalog
              </p>
              <p className="mt-0.5 font-semibold tabular-nums text-secondary text-xl sm:text-2xl">
                {totalCount}
              </p>
            </div>
            <div className="hidden h-10 w-px bg-secondary/10 sm:block lg:hidden xl:block" aria-hidden />
            <div className="text-center sm:text-left lg:text-center xl:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary/45">
                {hasFilters ? "Matching" : "Listed below"}
              </p>
              <p className="mt-0.5 font-semibold tabular-nums text-primary text-xl sm:text-2xl">
                {visibleCount}
              </p>
            </div>
          </div>
        </div>
      </header>

      <ProductGrid products={slice} />

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        query={paginationQuery}
      />
    </CatalogWidth>
  );
}
