"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { CatalogStockTab } from "@/lib/catalog/filter-products";

type CatalogStockTabsProps = {
  active: CatalogStockTab;
};

export function CatalogStockTabs({ active }: CatalogStockTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname === "/client/product" ? "/client/product" : "/";

  function href(tab: CatalogStockTab): string {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("page");
    if (tab === "all") {
      p.delete("stock");
    } else {
      p.set("stock", tab);
    }
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const tabBtn =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:min-h-10 sm:flex-none sm:px-6";

  return (
    <div
      className="mb-6 flex w-full gap-2 rounded-xl border border-secondary/15  p-1 sm:inline-flex sm:w-auto"
      role="tablist"
      aria-label="Filter by stock"
    >
      <Link
        href={href("all")}
        role="tab"
        aria-selected={active === "all"}
        className={`${tabBtn} ${
          active === "all"
            ? "border border-secondary/12 bg-white text-secondary shadow-sm"
            : "border border-transparent text-secondary/65 hover:bg-white/70 hover:text-secondary"
        }`}
      >
        ALL
      </Link>
      <Link
        href={href("in")}
        role="tab"
        aria-selected={active === "in"}
        className={`${tabBtn} ${
          active === "in"
            ? "border border-secondary/12 bg-white text-secondary shadow-sm"
            : "border border-transparent text-secondary/65 hover:bg-white/70 hover:text-secondary"
        }`}
      >
        In Stock
      </Link>
      <Link
        href={href("out")}
        role="tab"
        aria-selected={active === "out"}
        className={`${tabBtn} ${
          active === "out"
            ? "border border-secondary/12 bg-white text-secondary shadow-sm"
            : "border border-transparent text-secondary/65 hover:bg-white/70 hover:text-secondary"
        }`}
      >
        Out of Stock
      </Link>
    </div>
  );
}
