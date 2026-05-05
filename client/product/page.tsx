import { Suspense } from "react";

import { CatalogPagination } from "@/components/products/CatalogPagination";
import { CatalogScrollRestore } from "@/components/catalog/CatalogScrollRestore";
import { CatalogStockTabs } from "@/components/products/CatalogStockTabs";
import { CatalogWidth } from "@/components/layout/CatalogWidth";
import { ProductGrid } from "@/components/products/ProductGrid";
import {
  CATALOG_PAGE_SIZE,
  getCatalogPageSlice,
  parseCatalogPage,
} from "@/lib/catalog/pagination";
import {
  filterProducts,
  parseCatalogStockTab,
} from "@/lib/catalog/filter-products";
import { getCatalogProducts } from "@/lib/catalog/server-catalog";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    stock?: string;
  }>;
};

function categoryHeadingLabel(raw: string | undefined): string {
  const t = raw?.trim() ?? "";
  if (!t || t.toLowerCase() === "all") return "All categories";
  try {
    return decodeURIComponent(t.replace(/\+/g, " "));
  } catch {
    return t;
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const stockTab = parseCatalogStockTab(
    typeof params.stock === "string" ? params.stock : undefined,
  );
  const pageRaw = parseCatalogPage(params.page);

  const products = await getCatalogProducts();
  const filtered = filterProducts(products, q, category, stockTab);
  const { slice, totalPages, page } = getCatalogPageSlice(
    filtered,
    pageRaw,
    CATALOG_PAGE_SIZE,
  );

  const paginationQuery = { q, category, stock: stockTab };

  const visibleCount = filtered.length;
  const categoryLabel = categoryHeadingLabel(category);

  return (
    <CatalogWidth className="flex flex-1 flex-col py-6 sm:py-8 lg:py-10">
      <CatalogScrollRestore />
      <header className="mb-8 border-b border-secondary/15 pb-8 sm:mb-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="min-w-0 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary/45">
              Selected category
            </p>
            <p className="mt-1.5 text-lg font-semibold text-secondary sm:text-xl">
              {categoryLabel}
            </p>
          </div>
          <p className="shrink-0 text-left text-sm tabular-nums text-secondary/55 sm:text-right">
            {visibleCount === 1 ? "1 product" : `${visibleCount} products`}
          </p>
        </div>

        <div className="mt-8 max-w-2xl text-left">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">
            Products
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-secondary/70 sm:text-[15px]">
            Ambassador commercial kitchen equipment and supplies. Use the search
            bar and category menu above to narrow results — prices shown in PKR.
            Use ALL to see everything, or switch to In Stock / Out of Stock.
          </p>
        </div>
      </header>

      <Suspense
        fallback={
          <div
            className="mb-6 h-[3rem] max-w-md animate-pulse rounded-xl bg-secondary/[0.06] sm:h-[2.75rem]"
            aria-hidden
          />
        }
      >
        <CatalogStockTabs active={stockTab} />
      </Suspense>

      <ProductGrid products={slice} />

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        query={paginationQuery}
      />
    </CatalogWidth>
  );
}
