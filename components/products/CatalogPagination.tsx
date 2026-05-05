"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type CatalogPaginationQuery = {
  q?: string;
  category?: string;
  stock?: string;
};

type CatalogPaginationProps = {
  page: number;
  totalPages: number;
  query: CatalogPaginationQuery;
};

export function CatalogPagination({
  page,
  totalPages,
  query,
}: CatalogPaginationProps) {
  const pathname = usePathname();
  const basePath = pathname === "/client/product" ? "/client/product" : "/";

  function buildHref(pageNum: number): string {
    const params = new URLSearchParams();
    if (query.q?.trim()) params.set("q", query.q.trim());
    if (query.category && query.category !== "all") {
      params.set("category", query.category);
    }
    if (query.stock === "in" || query.stock === "out") {
      params.set("stock", query.stock);
    }
    if (pageNum > 1) params.set("page", String(pageNum));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  if (totalPages <= 1) return null;

  const prevPage = page - 1;
  const nextPage = page + 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const btn =
    "inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-lg border border-secondary px-4 text-sm font-semibold text-secondary transition-colors hover:bg-secondary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

  const btnPrimary =
    "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-center sm:gap-6"
      aria-label="Product list pagination"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {canPrev ? (
          <Link href={buildHref(prevPage)} className={btn}>
            Previous
          </Link>
        ) : (
          <span className={btn} aria-disabled="true">
            Previous
          </span>
        )}
        {canNext ? (
          <Link href={buildHref(nextPage)} className={btnPrimary}>
            Next
          </Link>
        ) : (
          <span className={btnPrimary} aria-disabled="true">
            Next
          </span>
        )}
      </div>
      <p className="text-center text-sm text-secondary/75">
        Page <span className="font-semibold text-secondary">{page}</span> of{" "}
        <span className="font-semibold text-secondary">{totalPages}</span>
      </p>
    </nav>
  );
}
