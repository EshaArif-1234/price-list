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

  return (
    <CatalogWidth className="flex flex-1 flex-col py-6 sm:py-8 lg:py-10 xl:py-12">
      <header className="mb-6 border-l-4 border-primary pl-3 sm:mb-8 sm:pl-4">
        <h1 className="text-xl font-semibold tracking-tight text-secondary min-[400px]:text-2xl lg:text-3xl">
          Products
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-secondary/75 sm:text-[15px] lg:text-base lg:leading-relaxed">
          Shows products from your MongoDB catalog when the server is
          configured; otherwise the built-in demo list. Use the category menu
          beside search or type to match names, categories, brands, and
          specifications.
        </p>
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
